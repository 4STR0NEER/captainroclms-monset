/**
 * Smooth Tab, adapted from Kokonut UI (MIT, kokonutui.com, @dorianbaffier).
 * Changes for JazzRoc: TS stripped to JS, demo tabs removed, palette colours, 48px tabs,
 * panel styling left to the caller. Swipe the panel or use the tabs (arrow keys work too).
 */
import { animate, useMotionValue } from "motion/react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
const cn = (...classes) => classes.filter(Boolean).join(" ");
// Past the first or last tab the panel moves this fraction of the drag.
const RUBBER_BAND = .35;
// A release this fast (px per ms) changes tab however short the drag was.
const SWIPE_VELOCITY = .11;
// Movement before deciding between a horizontal swipe and a vertical scroll.
const AXIS_LOCK = 6;
// Release velocity is measured over the last stretch of the drag only.
const VELOCITY_WINDOW = 100;
// A panel one full width away sits at this opacity, so the neighbour reads
// as "next" while it slides in.
const NEIGHBOUR_OPACITY = .35;
// Just under critical damping: a firm settle, a hint of overshoot only after
// a fast flick.
const SPRING = {
	type: "spring",
	stiffness: 420,
	damping: 38
};
const EASE_OUT = [
	.23,
	1,
	.32,
	1
];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
/** The indicator rectangle at a fractional tab position. */
function indicatorRect(rects, progress) {
	const last = rects.length - 1;
	if (last < 0) {
		return null;
	}
	const p = clamp(progress, 0, last);
	const i = Math.min(Math.floor(p), Math.max(last - 1, 0));
	const a = rects[i];
	const b = rects[Math.min(i + 1, last)];
	const t = p - i;
	let left = lerp(a.left, b.left, t);
	let width = lerp(a.width, b.width, t);
	// Rubber-banding past an end: the pill presses against the wall and gives
	// on the far side instead of sliding out of the track.
	const over = progress < 0 ? -progress : progress - last;
	if (over > 0) {
		const squash = width * Math.min(over, .5) * .4;
		width -= squash;
		if (progress > last) {
			left += squash;
		}
	}
	return {
		left,
		width,
		top: a.top,
		height: a.height
	};
}
/** Rubber-bands a raw position that runs past the first or last tab. */
function rubberBand(raw, last) {
	if (raw < 0) {
		return raw * RUBBER_BAND;
	}
	if (raw > last) {
		return last + (raw - last) * RUBBER_BAND;
	}
	return raw;
}
export default function SmoothTab({ items, defaultTabId, value, onChange, className, activeColor = "bg-deep", activeTextColor = "text-key", label = "Sections" }) {
	const count = items.length;
	const indexOf = (id) => Math.max(items.findIndex((item) => item.id === id), 0);
	const [uncontrolled, setUncontrolled] = useState(() => indexOf(defaultTabId));
	const selected = value === undefined ? clamp(uncontrolled, 0, Math.max(count - 1, 0)) : indexOf(value);
	// Captured once, so React never rewrites the imperatively painted styles.
	const [initial] = useState(selected);
	// Fractional tab position: 0 … count - 1, beyond while rubber-banding.
	// It drives the panel track, the indicator and the label clip directly,
	// so a drag never re-renders React.
	const progress = useMotionValue(selected);
	const baseId = useId();
	const tablistRef = useRef(null);
	const overlayRef = useRef(null);
	const trackRef = useRef(null);
	const tabRefs = useRef([]);
	const panelRefs = useRef([]);
	const rects = useRef([]);
	const size = useRef({
		width: 0,
		height: 0
	});
	const anim = useRef(null);
	const target = useRef(selected);
	const drag = useRef(null);
	const suppressClick = useRef(false);
	const reducedMotion = useRef(false);
	const latest = useRef({
		count,
		items,
		selected,
		onChange
	});
	latest.current = {
		count,
		items,
		selected,
		onChange
	};
	const paint = useCallback((p) => {
		const track = trackRef.current;
		if (track) {
			track.style.transform = `translate3d(${-p * 100 / count}%, 0, 0)`;
		}
		panelRefs.current.forEach((panel, i) => {
			if (panel) {
				const d = Math.min(Math.abs(p - i), 1);
				panel.style.opacity = String(1 - d * (1 - NEIGHBOUR_OPACITY));
			}
		});
		const overlay = overlayRef.current;
		const r = indicatorRect(rects.current, p);
		if (overlay && r) {
			const right = size.current.width - r.left - r.width;
			const bottom = size.current.height - r.top - r.height;
			overlay.style.clipPath = `inset(${r.top}px ${right}px ${bottom}px ${r.left}px round ${r.height / 2}px)`;
		}
	}, [count]);
	// Measure the tabs before paint, and again on resize and font load.
	useLayoutEffect(() => {
		const tablist = tablistRef.current;
		if (!tablist) {
			return;
		}
		let alive = true;
		const measure = () => {
			if (!alive) {
				return;
			}
			// Sub-pixel rects, so the clip lines up with the labels exactly.
			// Divided by the list's scale in case an ancestor is transformed.
			const box = tablist.getBoundingClientRect();
			const ratio = box.width / (tablist.offsetWidth || 1);
			// offsetWidth is rounded: only a real transform counts as a scale.
			const scale = Math.abs(ratio - 1) < .01 ? 1 : ratio;
			size.current = {
				width: box.width / scale,
				height: box.height / scale
			};
			rects.current = tabRefs.current.slice(0, count).map((tab) => {
				const r = tab?.getBoundingClientRect();
				return r ? {
					left: (r.left - box.left) / scale,
					width: r.width / scale,
					top: (r.top - box.top) / scale,
					height: r.height / scale
				} : {
					left: 0,
					width: 0,
					top: 0,
					height: 0
				};
			});
			paint(progress.get());
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(tablist);
		document.fonts.ready.then(measure).catch(() => undefined);
		return () => {
			alive = false;
			observer.disconnect();
		};
	}, [
		count,
		paint,
		progress
	]);
	useEffect(() => {
		const unsubscribe = progress.on("change", paint);
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const sync = () => {
			reducedMotion.current = query.matches;
		};
		sync();
		query.addEventListener("change", sync);
		return () => {
			unsubscribe();
			query.removeEventListener("change", sync);
			anim.current?.stop();
		};
	}, [paint, progress]);
	/** Moves the position to a tab. `velocity` is in tabs per second. */
	const settle = useCallback((index, opts = {}) => {
		target.current = index;
		anim.current?.stop();
		anim.current = null;
		if (opts.instant) {
			progress.jump(index);
			return;
		}
		anim.current = reducedMotion.current ? animate(progress, index, {
			duration: .15,
			ease: EASE_OUT
		}) : animate(progress, index, {
			...SPRING,
			velocity: opts.velocity ?? 0
		});
	}, [progress]);
	const select = useCallback((index, opts) => {
		const { count: n, items: list, selected: current } = latest.current;
		const next = clamp(index, 0, n - 1);
		settle(next, opts);
		if (next !== current) {
			setUncontrolled(next);
			latest.current.onChange?.(list[next].id);
		}
	}, [settle]);
	// A controlled `value` changed from outside: follow it.
	useEffect(() => {
		if (selected !== target.current && !drag.current) {
			settle(selected);
		}
	}, [selected, settle]);
	const handleKeyDown = (e, i) => {
		const keys = {
			ArrowRight: (i + 1) % count,
			ArrowLeft: (i - 1 + count) % count,
			Home: 0,
			End: count - 1
		};
		const next = keys[e.key];
		if (next === undefined) {
			return;
		}
		e.preventDefault();
		tabRefs.current[next]?.focus();
		// A held key repeats faster than any spring settles: jump instead.
		select(next, { instant: e.repeat });
	};
	const onPointerDown = (e) => {
		if (count < 2 || e.pointerType === "mouse" && e.button !== 0) {
			return;
		}
		drag.current = {
			pointerId: e.pointerId,
			startX: e.clientX,
			startY: e.clientY,
			startProgress: progress.get(),
			axis: null,
			width: e.currentTarget.clientWidth || 1,
			samples: [{
				x: e.clientX,
				t: e.timeStamp
			}]
		};
	};
	const lockAxis = (current, e) => {
		const dx = e.clientX - current.startX;
		const dy = e.clientY - current.startY;
		if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK) {
			return;
		}
		// Vertical wins ties: the page scroll is what most people are after.
		current.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
		if (current.axis === "x") {
			// Catch the panel mid-flight, and keep the swipe alive when the
			// pointer leaves the panel.
			anim.current?.stop();
			current.startProgress = progress.get();
			current.startX = e.clientX;
			current.samples = [{
				x: e.clientX,
				t: e.timeStamp
			}];
			e.currentTarget.setPointerCapture(e.pointerId);
			e.currentTarget.dataset.dragging = "";
		}
	};
	const onPointerMove = (e) => {
		const current = drag.current;
		if (!current || current.pointerId !== e.pointerId) {
			return;
		}
		if (current.axis === null) {
			lockAxis(current, e);
		}
		if (current.axis !== "x") {
			return;
		}
		current.samples.push({
			x: e.clientX,
			t: e.timeStamp
		});
		while (current.samples.length > 2 && e.timeStamp - current.samples[0].t > VELOCITY_WINDOW) {
			current.samples.shift();
		}
		const raw = current.startProgress - (e.clientX - current.startX) / current.width;
		progress.set(rubberBand(raw, count - 1));
	};
	const endDrag = (e, cancelled) => {
		const current = drag.current;
		if (!current || current.pointerId !== e.pointerId) {
			return;
		}
		drag.current = null;
		delete e.currentTarget.dataset.dragging;
		if (current.axis !== "x") {
			return;
		}
		// Swallow the click this release may send. A touch swipe sends none,
		// so the flag clears on the next tick instead of eating a later tap.
		if (!cancelled) {
			suppressClick.current = true;
			window.setTimeout(() => {
				suppressClick.current = false;
			}, 0);
		}
		const first = current.samples[0];
		// px per ms; negative is a swipe towards the next tab.
		const vx = (e.clientX - first.x) / Math.max(e.timeStamp - first.t, 1);
		const p = progress.get();
		let next = Math.round(p);
		if (!cancelled && Math.abs(vx) > SWIPE_VELOCITY) {
			next = vx < 0 ? Math.floor(p) + 1 : Math.ceil(p) - 1;
		}
		// The spring starts at the finger's speed, so the hand-off is seamless.
		select(next, { velocity: -vx * 1e3 / current.width });
	};
	const tabId = (i) => `${baseId}-tab-${i}`;
	const panelId = (i) => `${baseId}-panel-${i}`;
	return <div className={cn("flex w-full flex-col gap-4", className)}>
      <div className="flex">
        <div aria-label={label} className="relative inline-flex max-w-full rounded-full bg-key p-1 shadow-[var(--shadow-lift)]" ref={tablistRef} role="tablist">
          {items.map((item, i) => {
		const Icon = item.icon;
		const isSelected = i === selected;
		return <button aria-controls={panelId(i)} aria-selected={isSelected} className={cn("relative flex min-h-11 shrink-0 items-center gap-2 rounded-full px-5 py-2 font-bold", "text-deep transition-colors duration-150 ease-out", "outline-none focus-visible:outline-3 focus-visible:outline-deep focus-visible:outline-offset-2")} id={tabId(i)} key={item.id} onClick={() => select(i)} onKeyDown={(e) => handleKeyDown(e, i)} ref={(el) => {
			tabRefs.current[i] = el;
		}} role="tab" tabIndex={isSelected ? 0 : -1} type="button">
                {Icon && <Icon aria-hidden="true" className="size-5" />}
                <span className="whitespace-nowrap">{item.title}</span>
              </button>;
	})}
          {/* The same labels in the active color, clipped to the indicator,
	so each label is exactly right at every point of the slide with
	no color tween. */}
          <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 flex p-1", activeColor)} ref={overlayRef} style={{ clipPath: "inset(0 100% 0 0)" }}>
            {items.map((item) => {
		const Icon = item.icon;
		return <span className={cn("flex min-h-11 shrink-0 items-center gap-2 px-5 py-2 font-bold", activeTextColor)} key={item.id}>
                  {Icon && <Icon className="size-5" />}
                  <span className="whitespace-nowrap">{item.title}</span>
                </span>;
	})}
          </div>
        </div>
      </div>

      <div className="relative -mx-3 touch-pan-y overflow-hidden data-dragging:cursor-grabbing" onClickCapture={(e) => {
		if (suppressClick.current) {
			suppressClick.current = false;
			e.preventDefault();
			e.stopPropagation();
		}
	}} onLostPointerCapture={(e) => endDrag(e, false)} onPointerCancel={(e) => endDrag(e, true)} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={(e) => endDrag(e, false)}>
        <div className="flex will-change-transform" ref={trackRef} style={{
		width: `${count * 100}%`,
		transform: `translate3d(${-initial * 100 / count}%, 0, 0)`
	}}>
          {items.map((item, i) => <div aria-labelledby={tabId(i)} className="px-3 pb-6 pt-1 outline-none focus-visible:ring-3 focus-visible:ring-deep focus-visible:ring-inset rounded-[var(--radius-card)]" id={panelId(i)} inert={i !== selected} key={item.id} ref={(el) => {
		panelRefs.current[i] = el;
	}} role="tabpanel" style={{
		width: `${100 / count}%`,
		opacity: i === initial ? 1 : NEIGHBOUR_OPACITY
	}} tabIndex={i === selected ? 0 : -1}>
              {item.content}
            </div>)}
        </div>
      </div>
    </div>;
}

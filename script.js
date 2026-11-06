(() => {
    const brand = "withoutminh";
    const title = document.querySelector("h1");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
        document.title = `@${brand}`;
        return;
    }

    let visibleLetters = 0;

    document.title = "@";

    window.setInterval(() => {
        visibleLetters = visibleLetters === brand.length ? 0 : visibleLetters + 1;
        document.title = `@${brand.slice(0, visibleLetters)}`;
    }, 260);

    const scheduleFlicker = () => {
        const delay = Math.random() * 3200 + 700;

        window.setTimeout(() => {
            const flashes = Math.random() < 0.35 ? 2 : 1;
            let flashCount = 0;

            const flash = () => {
                title.classList.add("flicker-off");

                window.setTimeout(() => {
                    title.classList.remove("flicker-off");
                    flashCount += 1;

                    if (flashCount < flashes) {
                        window.setTimeout(flash, Math.random() * 130 + 35);
                    } else {
                        scheduleFlicker();
                    }
                }, Math.random() * 75 + 25);
            };

            flash();
        }, delay);
    };

    scheduleFlicker();
})();

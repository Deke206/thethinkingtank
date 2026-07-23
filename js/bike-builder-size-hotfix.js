(() => {
  "use strict";

  const form = document.getElementById("bikeBuilderForm");
  const mainBike = document.getElementById("mainBikeGroup");
  if (!form || !mainBike) return;

  const frameScales = {
    toddler: .66,
    preschool: .75,
    youth: .85,
    teen: .94,
    adult: 1
  };

  const bodyLayouts = {
    comfort: { fit: 1.05, centerX: 441, levelY: 54 },
    mountain: { fit: 1.02, centerX: 463, levelY: 39 },
    fatTire: { fit: .98, centerX: 462, levelY: 54 },
    cargo: { fit: .94, centerX: 449, levelY: 65 }
  };

  const preserveSelectedSize = () => {
    const frameValue = document.getElementById("frameSize")?.value || "adult";
    const bodyValue = document.getElementById("bikeBodyStyle")?.value || "comfort";
    const frameScale = frameScales[frameValue] || 1;
    const layout = bodyLayouts[bodyValue] || bodyLayouts.comfort;
    const stageScale = layout.fit * frameScale;
    const translateX = Math.round(450 - (layout.centerX * stageScale));

    // Keep each selected bicycle's size, but place every size at the adult
    // bicycle's vertical level so the child choices remain inside the panel.
    mainBike.setAttribute(
      "transform",
      `translate(${translateX} ${layout.levelY}) scale(${stageScale})`
    );
  };

  form.addEventListener("change", preserveSelectedSize);
  form.addEventListener("reset", () => window.setTimeout(preserveSelectedSize, 30));
  preserveSelectedSize();
})();

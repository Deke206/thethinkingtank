(() => {
  "use strict";

  const data = window.ShynetymeBikeBuilderData;
  if (!data) return;
  const { bikeBodies } = data;

  const idFor = (prefix, base) => prefix ? `${prefix}${base.charAt(0).toUpperCase()}${base.slice(1)}` : base;
  const pathsMarkup = (paths) => paths.map((d) => `<path d="${d}"/>`).join("");

  const wheelMarkup = (wheel) => {
    const rim = Math.max(44, wheel.r - 22);
    const d = Math.round(rim * .7);
    return `
      <circle class="bike-tire" cx="${wheel.x}" cy="${wheel.y}" r="${wheel.r}"/>
      <circle class="bike-rim" cx="${wheel.x}" cy="${wheel.y}" r="${rim}"/>
      <g class="bike-spoke"><path d="M${wheel.x} ${wheel.y-rim}V${wheel.y+rim}M${wheel.x-rim} ${wheel.y}H${wheel.x+rim}M${wheel.x-d} ${wheel.y-d}L${wheel.x+d} ${wheel.y+d}M${wheel.x-d} ${wheel.y+d}L${wheel.x+d} ${wheel.y-d}"/></g>`;
  };

  const basketMarkup = (id, basket) => {
    const slant = 16;
    return `<g id="${id}" class="zone zone-off" stroke-width="8"><path d="M${basket.x} ${basket.y}H${basket.x+basket.w}L${basket.x+basket.w-slant} ${basket.y+basket.h}H${basket.x+slant}Z"/><path d="M${basket.x+10} ${basket.y+26}H${basket.x+basket.w-10}M${basket.x+8} ${basket.y+basket.h-15}H${basket.x+basket.w-10}M${basket.x+Math.round(basket.w*.35)} ${basket.y+5}L${basket.x+Math.round(basket.w*.3)} ${basket.y+basket.h-5}M${basket.x+Math.round(basket.w*.7)} ${basket.y+5}L${basket.x+Math.round(basket.w*.65)} ${basket.y+basket.h-5}"/></g>`;
  };

  const tailMarkup = (id, x, y) => `<g id="${id}" class="tail-light zone zone-off" stroke-width="5"><rect class="tail-housing" x="${x}" y="${y}" width="80" height="38" rx="8"/><rect class="tail-pixel tail-outer" x="${x+6}" y="${y+7}" width="10" height="24" rx="2"/><rect class="tail-pixel tail-inner" x="${x+20}" y="${y+7}" width="10" height="24" rx="2"/><rect class="tail-pixel tail-center" x="${x+34}" y="${y+7}" width="12" height="24" rx="2"/><rect class="tail-pixel tail-inner" x="${x+50}" y="${y+7}" width="10" height="24" rx="2"/><rect class="tail-pixel tail-outer" x="${x+64}" y="${y+7}" width="10" height="24" rx="2"/></g>`;

  const signalsMarkup = (id, signal) => `<g id="${id}" class="turn-signal zone zone-off" stroke-width="3"><g class="signal-arrow signal-left"><path class="signal-segment signal-step-3" d="M${signal.left} ${signal.y}L${signal.left+33} ${signal.y-28}V${signal.y-12}H${signal.left+45}V${signal.y+13}H${signal.left+33}V${signal.y+29}Z"/><rect class="signal-segment signal-step-2" x="${signal.left+45}" y="${signal.y-12}" width="13" height="25" rx="2"/><rect class="signal-segment signal-step-1" x="${signal.left+58}" y="${signal.y-12}" width="13" height="25" rx="2"/></g><g class="signal-arrow signal-right"><rect class="signal-segment signal-step-1" x="${signal.right}" y="${signal.y-12}" width="13" height="25" rx="2"/><rect class="signal-segment signal-step-2" x="${signal.right+13}" y="${signal.y-12}" width="13" height="25" rx="2"/><path class="signal-segment signal-step-3" d="M${signal.right+71} ${signal.y}L${signal.right+38} ${signal.y-28}V${signal.y-12}H${signal.right+26}V${signal.y+13}H${signal.right+38}V${signal.y+29}Z"/></g></g>`;

  const equipmentMarkup = () => `
    <g id="batteryBoxSvg" class="equipment-layer equipment-off"><rect x="395" y="318" width="92" height="72" rx="10"/><path d="M418 340H464M418 360H464"/></g>
    <g id="controllerBoxSvg" class="equipment-layer equipment-off"><rect x="490" y="300" width="72" height="48" rx="9"/><circle cx="510" cy="324" r="5"/><circle cx="542" cy="324" r="5"/></g>
    <g id="headlightSvg" class="equipment-layer equipment-off"><circle cx="625" cy="212" r="24"/><path d="M604 212H646"/></g>
    <g id="underglowSvg" class="equipment-layer equipment-off equipment-light"><path d="M285 500C390 535 515 535 625 500" fill="none" stroke-width="18" stroke-linecap="round"/></g>
    <g id="rearRackSvg" class="equipment-layer equipment-off"><path d="M122 296H286M140 296L172 404M268 296L236 404" fill="none" stroke-width="12" stroke-linecap="round"/></g>
    <g id="saddlebagsSvg" class="equipment-layer equipment-off"><path d="M138 304H210L202 378H126Z"/><path d="M218 304H290L302 378H226Z"/></g>
    <g id="childSeatSvg" class="equipment-layer equipment-off"><path d="M230 194H314V294H230Z"/><path d="M240 194V156H304V194M244 230H300" fill="none" stroke-width="10"/></g>
    <g id="cargoTrailerSvg" class="equipment-layer equipment-off"><path d="M42 420H164V502H42Z"/><circle cx="64" cy="522" r="28"/><circle cx="144" cy="522" r="28"/><path d="M164 460L224 438" fill="none" stroke-width="10"/></g>
    <g id="mirrorsSvg" class="equipment-layer equipment-off"><circle cx="548" cy="112" r="22"/><circle cx="652" cy="112" r="22"/><path d="M560 130L576 158M640 130L620 158" fill="none" stroke-width="8"/></g>
    <g id="speakersSvg" class="equipment-layer equipment-off"><circle cx="550" cy="222" r="22"/><circle cx="606" cy="222" r="22"/><circle cx="550" cy="222" r="7"/><circle cx="606" cy="222" r="7"/></g>
    <g id="ledSignSvg" class="equipment-layer equipment-off equipment-light"><rect x="100" y="188" width="170" height="62" rx="8"/><text x="185" y="228" text-anchor="middle" font-size="24" font-weight="900">SHYNETYME</text></g>`;

  const renderSideBike = (group, styleKey, prefix, includeEquipment = false) => {
    const body = bikeBodies[styleKey] || bikeBodies.comfort;
    const frameId = idFor(prefix, "frameLightsSvg");
    const forksId = idFor(prefix, "frontForksSvg");
    const frontWheelId = idFor(prefix, "frontWheelSvg");
    const rearWheelId = idFor(prefix, "rearWheelSvg");
    const barsId = idFor(prefix, "handlebarsSvg");
    const frontBasketId = idFor(prefix, "frontBasketSvg");
    const rearBasketId = idFor(prefix, "rearBasketSvg");
    const pouchId = idFor(prefix, "handlebarPouchSvg");
    const seatPouchId = idFor(prefix, "seatPouchSvg");
    const flagId = idFor(prefix, "flagPoleSvg");
    const tailId = idFor(prefix, "rearBrakeSvg");
    const signalId = idFor(prefix, "turnSignalsSvg");
    const helmetId = idFor(prefix, "helmetSvg");
    const helmetLightsId = idFor(prefix, "helmetLightsSvg");
    const helmetFrontId = idFor(prefix, "helmetFrontLight");
    const helmetRearId = idFor(prefix, "helmetRearLight");

    group.innerHTML = `
      ${wheelMarkup(body.rearWheel)}${wheelMarkup(body.frontWheel)}
      <g class="bike-metal">${pathsMarkup(body.frame)}${pathsMarkup(body.forks)}${pathsMarkup(body.metal)}</g>
      <g id="${frameId}" class="zone zone-off" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">${pathsMarkup(body.frame)}</g>
      <g id="${forksId}" class="zone zone-off" fill="none" stroke-width="16" stroke-linecap="round">${pathsMarkup(body.forks)}</g>
      <circle id="${frontWheelId}" class="zone zone-off" cx="${body.frontWheel.x}" cy="${body.frontWheel.y}" r="${Math.max(42,body.frontWheel.r-12)}" fill="none" stroke-width="12"/>
      <circle id="${rearWheelId}" class="zone zone-off" cx="${body.rearWheel.x}" cy="${body.rearWheel.y}" r="${Math.max(42,body.rearWheel.r-12)}" fill="none" stroke-width="12"/>
      <path id="${barsId}" class="zone zone-off" d="${body.handlebar}" fill="none" stroke-width="16" stroke-linecap="round"/>
      ${basketMarkup(frontBasketId,body.frontBasket)}${basketMarkup(rearBasketId,body.rearBasket)}
      <g id="${flagId}" class="flag-pole zone zone-off" fill="none" stroke-linecap="round"><path class="flag-pole-light" d="M${body.flag.x} ${body.flag.bottom}V${body.flag.top}" stroke-width="12"/><path d="M${body.flag.x+7} ${body.flag.top+6}H${body.flag.x+132}L${body.flag.x+98} ${body.flag.top+48}L${body.flag.x+132} ${body.flag.top+90}H${body.flag.x+7}Z" fill="#e9ecef" stroke="#2d333b" stroke-width="4"/></g>
      <g id="${pouchId}" class="zone zone-off solid-green-zone" stroke-width="6"><rect x="${body.pouch.x}" y="${body.pouch.y}" width="${body.pouch.w}" height="${body.pouch.h}" rx="12"/></g>
      <g id="${seatPouchId}" class="zone zone-off solid-green-zone" stroke-width="6"><path d="${body.seatPouch}"/></g>
      ${tailMarkup(tailId,body.tail.x,body.tail.y)}${signalsMarkup(signalId,body.signal)}
      <g id="${helmetId}" transform="translate(${body.helmet.x} ${body.helmet.y})"><path d="M0 70C0 20 35 0 75 0s75 20 75 70v15H0Z" fill="#d9dde5" stroke="#2d333b" stroke-width="8"/><path id="${helmetLightsId}" class="zone zone-off" d="M18 68C22 30 45 18 75 18s53 12 57 50" fill="none" stroke-width="12" stroke-linecap="round"/><circle id="${helmetFrontId}" cx="142" cy="70" r="10" fill="#b5bac3" stroke="#2d333b" stroke-width="4"/><circle id="${helmetRearId}" cx="8" cy="70" r="10" fill="#b5bac3" stroke="#2d333b" stroke-width="4"/></g>
      ${includeEquipment ? equipmentMarkup() : ""}`;
  };

  const renderRearBike = (prefix, bodyLabel, centerX, scale) => {
    const tailId = idFor(prefix, "rearBrakeRearSvg");
    const signalId = idFor(prefix, "turnSignalsRearSvg");
    const roleLabel = prefix ? "ADDITIONAL KID BICYCLE" : "PRIMARY BICYCLE";
    return `<g transform="translate(${centerX} 165) scale(${scale})"><text x="0" y="-34" text-anchor="middle" font-size="17" font-weight="900" fill="#171a20">${roleLabel}</text><text x="0" y="-12" text-anchor="middle" font-size="15" font-weight="750" fill="#38404a">${bodyLabel}</text><circle cx="0" cy="190" r="78" fill="#fff" stroke="#2d333b" stroke-width="14"/><path d="M0 42V222M-58 68H58" stroke="#2d333b" stroke-width="14" stroke-linecap="round"/>${tailMarkup(tailId,-40,105)}${signalsMarkup(signalId,{left:-122,right:51,y:124})}</g>`;
  };

  const renderRearViewPanel = (rearPanel, mainBodyKey, kidBodyKey, hasKid) => {
    const { bikeStyleLabels } = window.ShynetymeBikeBuilderData;
    rearPanel.setAttribute("transform", "translate(0 0)");
    rearPanel.innerHTML = `<rect x="35" y="35" width="830" height="555" rx="28" fill="rgba(255,255,255,.96)" stroke="#171a20" stroke-width="6"/><text x="450" y="82" text-anchor="middle" font-size="26" font-weight="900" fill="#171a20">REAR SAFETY VIEW</text>${hasKid ? renderRearBike("", bikeStyleLabels[mainBodyKey], 270, 1.05)+renderRearBike("kid",bikeStyleLabels[kidBodyKey],630,.82) : renderRearBike("", bikeStyleLabels[mainBodyKey],450,1.2)}`;
  };

  const fitTransform = (body, requestedScale, centerX, availableWidth, bottomY) => {
    const width = body.bounds.maxX - body.bounds.minX;
    const height = body.bounds.maxY - body.bounds.minY;
    const scale = Math.min(requestedScale * body.scale, availableWidth / width, 535 / height);
    return {
      x: Math.round(centerX - ((body.bounds.minX + body.bounds.maxX) / 2) * scale),
      y: Math.round(bottomY - body.bounds.maxY * scale),
      scale
    };
  };

  const setSvgHidden = (element, hidden) => {
    if (!element) return;
    if (hidden) element.setAttribute("hidden", "");
    else element.removeAttribute("hidden");
  };

  window.ShynetymeBikeBuilderRenderer = { idFor, renderSideBike, renderRearViewPanel, fitTransform, setSvgHidden };
})();

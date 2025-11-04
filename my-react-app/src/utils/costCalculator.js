// Cost calculation utilities for window management system

// Convert inches to feet
export const inchesToFeet = (inches) => {
  return inches / 12;
};

// Convert feet to inches
export const feetToInches = (feet) => {
  return feet * 12;
};

// Calculate area in square feet
export const calculateArea = (length, width, unit = 'feet') => {
  let lengthFeet = length;
  let widthFeet = width;
  
  if (unit === 'inches') {
    lengthFeet = inchesToFeet(length);
    widthFeet = inchesToFeet(width);
  }
  
  return lengthFeet * widthFeet;
};

// Calculate perimeter
export const calculatePerimeter = (length, width, unit = 'feet') => {
  let lengthFeet = length;
  let widthFeet = width;
  
  if (unit === 'inches') {
    lengthFeet = inchesToFeet(length);
    widthFeet = inchesToFeet(width);
  }
  
  return 2 * (lengthFeet + widthFeet);
};

// Calculate cost for Mini Domal (Sliding Window)
export const calculateMiniDomalCost = (dimensions, tracks, glassType, rates, hasMosquitoNet = false, hasGrill = false, numberOfPipes = 0) => {
  const { length, width, unit } = dimensions;
  // For windows: length = horizontal dimension (width), width = vertical dimension (height)
  const lengthFeet = unit === 'inches' ? inchesToFeet(length) : length;
  const widthFeet = unit === 'inches' ? inchesToFeet(width) : width;
  const l = lengthFeet; // length (horizontal dimension)
  const h = widthFeet;  // height (vertical dimension)
  const area = lengthFeet * widthFeet;
  const perimeter = calculatePerimeter(length, width, unit);
  const outerPerimeter = 2 * (lengthFeet + widthFeet);
  
  // Material rates (default if not provided)
  const defaultRates = {
    materialPerKg: 345,
    coatingPerKg: 60,
    glassPlane: 45,
    glassReflective: 75,
    lockPerTrack: 100,
    bearingPerUnit: 20,
    clampPerUnit: 20,
    glassRubberPerFeet: 8,
    woolfilePerFeet: 2,
    labourPerSqft: 50,
    fixedCharge: 30,
    mosquitoNetPerSqft: 20,
    brightBarPerUnit: 2.5,
    coverPerUnit: 1
  };
  
  const materialRate = rates?.materialPerKg || defaultRates.materialPerKg;
  const coatingRate = rates?.coatingPerKg || defaultRates.coatingPerKg;
  const glassRate = glassType === 'reflective' 
    ? (rates?.glassReflective || defaultRates.glassReflective)
    : (rates?.glassPlane || defaultRates.glassPlane);
  
  let outerFrameKg, outerFrameCost, shutterFrameKg, shutterFrameCost, 
      innerLockClipKg, innerLockClipCost, cChannelKg, cChannelCost,
      rtKg, rtCost, roundPipeKg, roundPipeCost, brightBarCost, coverCost,
      totalKg, coatingCost, glassArea, glassCost, lockCost, bearingCost,
      outerClampCost, innerClampCost, totalClampCost, glassRubberLength,
      glassRubberCost, woolfileLength, woolfileCost, labourCost, 
      fixedChargeCost, mosquitoNetCost;

  // Different calculation logic for grill
  if (hasGrill && numberOfPipes > 0) {
    // 1. Outer Frame: 2(l+h) * 0.200kg * 345rs
    const outerFrameLength = 2 * (l + h);
    outerFrameKg = outerFrameLength * 0.2625;
    outerFrameCost = outerFrameKg * materialRate;
    
    // 2. Shutter Frame: (2(l+h) + track * height) * 0.175kg * 345rs
    const shutterFrameLength = 2 * (l + h) + tracks * h;
    shutterFrameKg = shutterFrameLength * 0.175;
    shutterFrameCost = shutterFrameKg * materialRate;
    cChannelKg = 0;
    cChannelCost = 0;
    
    // 3. Inner Lock Clip: no of track * height * 0.0625kg * 345rs
    innerLockClipKg = tracks * h * 0.0625;
    innerLockClipCost = innerLockClipKg * materialRate;
    
    // 4. RT: h * 0.25kg * 345rs
    rtKg = h * 0.125;
    rtCost = rtKg * materialRate;
    
    // 5. Round Pipe: width * no of pipe required * 0.0625kg * 345rs
    roundPipeKg = l * numberOfPipes * 0.0625;
    roundPipeCost = roundPipeKg * materialRate;
    
    // 6. Coating: (outerframe kg + shutterframe kg + innerlockclip kg + rt kg + round pipe kg) * 60rs
    totalKg = outerFrameKg + shutterFrameKg + innerLockClipKg + rtKg + roundPipeKg;
    coatingCost = totalKg * coatingRate;
    
    // 7. Glass: 2(l+h) * glass type price per sqft
    glassArea = 2 * (l + h);
    glassCost = glassArea * glassRate;
    
    // 8. Lock: 2 * 100rs
    lockCost = 2 * (rates?.lockPerTrack || defaultRates.lockPerTrack);
    
    // 9. Bearing: 2 * 2 * 20rs
    bearingCost = 2 * 2 * (rates?.bearingPerUnit || defaultRates.bearingPerUnit);
    
    // 10. Clamp: Outer clamp = 8, Inner clamp = 8, Total 16 * 20rs
    outerClampCost = 8 * (rates?.clampPerUnit || defaultRates.clampPerUnit);
    innerClampCost = 8 * (rates?.clampPerUnit || defaultRates.clampPerUnit);
    totalClampCost = outerClampCost + innerClampCost;
    
    // 11. Glass Rubber: (2(l+h) + 2*no of track) * 8rs
    glassRubberLength = 2*(2 * ((l/2) + h));
    glassRubberCost = glassRubberLength * (rates?.glassRubberPerFeet || defaultRates.glassRubberPerFeet);
    
    // 12. Woolfile: (outerPerimeter + (2 * width) + (2 * height) + (tracks * 2 * height)) * 2rs
    woolfileLength = outerPerimeter + (2 * l) + (2 * h) + (tracks * 2 * h);
    woolfileCost = woolfileLength * (rates?.woolfilePerFeet || defaultRates.woolfilePerFeet);
    
    // 13. Bright Bar: width * no of pipe required * 12 * 2.25rs
    const brightBarRate = rates?.brightBarPerUnit || defaultRates.brightBarPerUnit;
    brightBarCost = l * numberOfPipes * 12 * brightBarRate;
    
    // 14. Cover: no of pipe required * 4 * 1rs
    const coverRate = rates?.coverPerUnit || defaultRates.coverPerUnit;
    coverCost = 40 * coverRate;
    
    // 15. Labour: area * 50rs
    labourCost = area * (rates?.labourPerSqft || defaultRates.labourPerSqft);
    
    // 16. Fixed Charge: 30rs
    fixedChargeCost = rates?.fixedCharge || defaultRates.fixedCharge;
    
    mosquitoNetCost = 0;
    
  } else if (hasMosquitoNet) {
    // 1. Outer Frame: outerFrameLength * 0.26875kg * 345rs
    const outerFrameLength = 2 * (l + h);
    outerFrameKg = outerFrameLength * 0.26875;
    outerFrameCost = outerFrameKg * materialRate;
    
    // 2. Shutter Frame: ((2 * (l + h) + tracks * h) * 0.175 * 345rs) + c-channel cost
    // First calculate base shutter frame: (2 * (l + h) + tracks * h) * 0.175 * 345rs
    const shutterFrameLength = (2 * ((l/2) + h))*3;
    shutterFrameKg = shutterFrameLength * 0.175;
    const shutterFrameBaseCost = shutterFrameKg * materialRate;
    
    // Then add C-Channel cost: (2 * ((l/2) + h) * 0.0625kg) * 345rs
    const cChannelLength = 2 * ((l / 2) + h);
    cChannelKg = cChannelLength * 0.0625;
    cChannelCost = cChannelKg * materialRate;
    
    // Shutter Frame Total Cost = Base Shutter Frame Cost + C-Channel Cost
    shutterFrameCost = shutterFrameBaseCost + cChannelCost;
    
    // 3. Inner Lock Clip: (tracks * h * 0.0625kg) * 345rs
    innerLockClipKg = 3 * h * 0.0625;
    innerLockClipCost = innerLockClipKg * materialRate;
    
    // 4. Coating: (outerframekg + shutterframe kg + c-channel kg + innerlockclipkg) * 60rs
    totalKg = outerFrameKg + shutterFrameKg + cChannelKg + innerLockClipKg;
    coatingCost = totalKg * coatingRate;
    
    // 5. Glass: 2(l+h) * glass type price
    glassArea = 2 * (l + h);
    glassCost = glassArea * glassRate;
    
    // 6. Lock: 2 * 100rs
    lockCost = 2 * (rates?.lockPerTrack || defaultRates.lockPerTrack);
    
    // 7. Bearing: 3 * 2 * 20rs
    bearingCost = 3 * 2 * (rates?.bearingPerUnit || defaultRates.bearingPerUnit);
    
    // 8. Clamps: Outer clamp = 4, Inner clamp = 4 * 3 = 12, Total 16 clamp * 20rs
    outerClampCost = 4 * (rates?.clampPerUnit || defaultRates.clampPerUnit);
    innerClampCost = 12 * (rates?.clampPerUnit || defaultRates.clampPerUnit);
    totalClampCost = outerClampCost + innerClampCost;
    
    // 9. Glass Rubber: (2 * (l + h) + h * tracks) * 8rs
    glassRubberLength = 2 * (l + h) + h * tracks;
    glassRubberCost = glassRubberLength * (rates?.glassRubberPerFeet || defaultRates.glassRubberPerFeet);
    
    // 10. Woolfile: (2 * ((2 * (l + h) + track * h) + (2 * h))) * 2rs
    woolfileLength =( 2 * ((2 * (l + h) + tracks * h))+ (2 * h));
    woolfileCost = woolfileLength * (rates?.woolfilePerFeet || defaultRates.woolfilePerFeet);
    
    // 11. Labour: area * 50rs
    labourCost = area * (rates?.labourPerSqft || defaultRates.labourPerSqft);
    
    // 12. Fixed Charge: 30rs
    fixedChargeCost = rates?.fixedCharge || defaultRates.fixedCharge;
    
    // 13. Mosquito Net: ((l/2) * h) * rate per sqft
    const mosquitoNetArea = (l / 2) * h;
    const mosquitoNetRate = rates?.mosquitoNetPerSqft || defaultRates.mosquitoNetPerSqft;
    mosquitoNetCost = mosquitoNetArea * mosquitoNetRate;
    
  } else {
    // Original calculation logic for 2 tracks without mosquito net
    // 1. Outer Frame: 2(l+h) * 0.200kg * 345 rs
    const outerFrameLength = 2 * (l + h);
    outerFrameKg = outerFrameLength * 0.200;
    outerFrameCost = outerFrameKg * materialRate;
    
    // 2. Shutter Frame: (2(l+h) + track * height) * 0.175kg * 345 rs
    const shutterFrameLength = 2 * (l + h) + tracks * h;
    shutterFrameKg = shutterFrameLength * 0.175;
    shutterFrameCost = shutterFrameKg * materialRate;
    cChannelKg = 0;
    cChannelCost = 0;
  
  // 3. Inner Lock Clip: no of track * height * 0.0625kg * 345rs
    innerLockClipKg = tracks * h * 0.0625;
    innerLockClipCost = innerLockClipKg * materialRate;
  
  // 4. Coating Charge: (outerframe kg + shutter frame kg + inner lock clip kg) * 60 rs
    totalKg = outerFrameKg + shutterFrameKg + innerLockClipKg;
    coatingCost = totalKg * coatingRate;
  
  // 5. Glass: 2(l+h) * glass type price per sqft
    glassArea = 2 * (l + h);
    glassCost = glassArea * glassRate;
  
  // 6. Lock: no of track * 100rs
    lockCost = tracks * (rates?.lockPerTrack || defaultRates.lockPerTrack);
  
  // 7. Bearing: number of track * 2 * 20rs
    bearingCost = tracks * 2 * (rates?.bearingPerUnit || defaultRates.bearingPerUnit);
  
  // 8. Outer Clamp: 4 * 20rs
    outerClampCost = 4 * (rates?.clampPerUnit || defaultRates.clampPerUnit);
  
  // 9. Inner Clamp: no of track * 4 * 20rs
    innerClampCost = tracks * 4 * (rates?.clampPerUnit || defaultRates.clampPerUnit);
    totalClampCost = outerClampCost + innerClampCost;
  
  // 10. Glass Rubber: (2(l+h) + 2*no of track) * 8rs
    glassRubberLength = 2 * (l + h) + h * tracks;
    glassRubberCost = glassRubberLength * (rates?.glassRubberPerFeet || defaultRates.glassRubberPerFeet);
  
  // 11. Woolfile: (outerPerimeter + (2 * width) + (2 * height) + (tracks * 2 * height)) * 2rs
    woolfileLength =( 2 * ((2 * (l + h) + tracks * h))+ (2 * h));
    woolfileCost = woolfileLength * (rates?.woolfilePerFeet || defaultRates.woolfilePerFeet);
  
  // 12. Labour: per square feet 50rs
    labourCost = area * (rates?.labourPerSqft || defaultRates.labourPerSqft);
    
    // 13. Fixed Charge: 30rs per window
    fixedChargeCost = rates?.fixedCharge || defaultRates.fixedCharge;
    
    mosquitoNetCost = 0;
    rtKg = 0;
    rtCost = 0;
    roundPipeKg = 0;
    roundPipeCost = 0;
    brightBarCost = 0;
    coverCost = 0;
  }
  
  // Total cost (cChannelCost is already included in shutterFrameCost when hasMosquitoNet is true)
  const totalCost = outerFrameCost + shutterFrameCost + innerLockClipCost + (rtCost || 0) + (roundPipeCost || 0) + coatingCost + 
                   glassCost + lockCost + bearingCost + totalClampCost + 
                   glassRubberCost + woolfileCost + labourCost + fixedChargeCost + mosquitoNetCost + (brightBarCost || 0) + (coverCost || 0);
  
  // Cost per square foot
  const costPerSqft = area > 0 ? totalCost / area : 0;
  
  return {
    area,
    dimensions: {
      length: lengthFeet,
      width: widthFeet,
      unit: 'feet'
    },
    breakdown: {
      outerFrame: {
        kg: outerFrameKg,
        cost: outerFrameCost
      },
      shutterFrame: {
        kg: hasMosquitoNet ? (shutterFrameKg + (cChannelKg || 0)) : shutterFrameKg,
        cost: shutterFrameCost
      },
      cChannel: {
        kg: cChannelKg || 0,
        cost: cChannelCost || 0
      },
      innerLockClip: {
        kg: innerLockClipKg,
        cost: innerLockClipCost
      },
      coating: {
        kg: totalKg,
        cost: coatingCost
      },
      glass: {
        area: glassArea,
        type: glassType,
        cost: glassCost
      },
      lock: {
        quantity: hasMosquitoNet ? 2 : (hasGrill ? 2 : tracks),
        cost: lockCost
      },
      bearing: {
        quantity: hasMosquitoNet ? 6 : (hasGrill ? 4 : (tracks * 2)),
        cost: bearingCost
      },
      outerClamp: {
        quantity: hasGrill ? 8 : (hasMosquitoNet ? 4 : 4),
        cost: outerClampCost
      },
      innerClamp: {
        quantity: hasGrill ? 8 : (hasMosquitoNet ? 12 : (tracks * 4)),
        cost: innerClampCost
      },
      totalClamp: {
        quantity: hasMosquitoNet ? 16 : (hasGrill ? 16 : undefined),
        cost: totalClampCost || (outerClampCost + innerClampCost)
      },
      glassRubber: {
        length: glassRubberLength,
        cost: glassRubberCost
      },
      woolfile: {
        length: woolfileLength,
        cost: woolfileCost
      },
      labour: {
        area: area,
        cost: labourCost
      },
      fixedCharge: {
        cost: fixedChargeCost
      },
      mosquitoNet: {
        area: hasMosquitoNet ? ((l / 2) * h) : 0,
        cost: mosquitoNetCost
      },
      rt: {
        kg: rtKg || 0,
        cost: rtCost || 0
      },
      roundPipe: {
        kg: roundPipeKg || 0,
        cost: roundPipeCost || 0
      },
      brightBar: {
        cost: brightBarCost || 0
      },
      cover: {
        quantity: hasGrill ? numberOfPipes : 0,
        cost: coverCost || 0
      }
    },
    totalCost,
    costPerSqft
  };
};

// Main cost calculator function
export const calculateWindowCost = (category, subCategory, dimensions, options = {}, rates = {}) => {
  if (category === 'sliding') {
    if (subCategory === 'miniDomal') {
      return calculateMiniDomalCost(
        dimensions,
        options.tracks || 2,
        options.glassType || 'plane',
        rates,
        options.hasMosquitoNet || false,
        options.hasGrill || false,
        options.numberOfPipes || 0
      );
    }
    // Add other subcategories (domal, ventena) here later
  }
  
  // Add openable window calculations here later
  
  return null;
};


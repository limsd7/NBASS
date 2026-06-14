
/**
 * HRV Frequency Domain Unit Converter
 * 
 * Converts logarithmic (Ln) values to raw (ms^2) values.
 * Used for aligning user input/device data (Ln) with Clinical Logic Engine expectations (Raw).
 */

/**
 * Converts a Logarithmic (Ln) value to Raw value (ms^2).
 * Formula: Raw = exp(Ln)
 * 
 * @param lnValue The logarithmic value
 * @returns The raw value, or 0 if input is invalid/zero
 */
export const convertLnToRaw = (lnValue: number | undefined | null): number => {
    if (!lnValue || lnValue <= 0) return 0;
    return Math.exp(lnValue);
};

/**
 * Safely converts an object of frequency parameters.
 * Only converts fields that are present and non-zero.
 */
export const convertFrequencyParameters = (
    params: { lf?: number; hf?: number; tp?: number; vlf?: number }
) => {
    return {
        lf: convertLnToRaw(params.lf),
        hf: convertLnToRaw(params.hf),
        tp: convertLnToRaw(params.tp),
        vlf: convertLnToRaw(params.vlf),
    };
};

/**
 * Converts EEG Percentage to absolute Score based on Brain Score.
 * Formula: Value = BrainScore * (Percent / 100)
 * 
 * @param brainScore The total Brain Score (0-100)
 * @param percent The percentage value of the specific EEG band (0-100)
 * @returns The calculated absolute score
 */
export const convertEEGPercentToScore = (brainScore: number, percent: number): number => {
    if (!brainScore || !percent) return 0;
    return brainScore * (percent / 100);
};

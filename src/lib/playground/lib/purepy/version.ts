import pinned_version from "../../../../../.purepy-version?raw";

// Pinned version of reference implementation
export const PUREPY_VERSION = pinned_version.trim();

// Specification version of the pinned reference implementation
export const SPEC_VERSION = PUREPY_VERSION.match(/^\d+\.\d+\.\d+/)![0];

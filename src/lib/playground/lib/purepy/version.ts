import pinned_version from "../../../../../.purepy-version?raw";

export const PUREPY_VERSION = pinned_version.trim();

export const SPEC_VERSION = PUREPY_VERSION.match(/^\d+\.\d+\.\d+/)![0];

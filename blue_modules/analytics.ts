/**
 * Analytics module - stub implementation
 * Bugsnag has been removed from this project
 */

let userHasOptedOut: boolean = false;

const A = async (event: string) => {};

A.setOptOut = (value: boolean) => {
  if (value) userHasOptedOut = true;
};

A.logError = (errorString: string) => {
  console.error(errorString);
};

export default A;

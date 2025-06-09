export function logResourceLoadError(event) {
  console.log("logResourceLoadError called with event - client", event);
  let src = event?.currentTarget?.src || event?.target?.src || event?.srcElement?.src || "unknown";
  let err = "Error loading: '" + src + "'";
  if (window.Rollbar) {
    Rollbar.error(err);
  } else {
    console.log(err);
  }
  return false;
}
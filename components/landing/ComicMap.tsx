const WIDGET_OPTIONS = {
  pos: { lat: 51.099847, lon: 71.435442, zoom: 16 },
  opt: { city: "astana" },
  org: "70000001093739592",
};

export function ComicMap() {
  const src = `https://widgets.2gis.com/widget?type=firmsonmap&options=${encodeURIComponent(
    JSON.stringify(WIDGET_OPTIONS)
  )}`;

  return (
    <div className="h-[340px] overflow-hidden rounded-card border-[3px] border-ink shadow-frame">
      <iframe
        src={src}
        width="100%"
        height="100%"
        frameBorder="0"
        title="Qadam School on 2GIS"
      />
    </div>
  );
}

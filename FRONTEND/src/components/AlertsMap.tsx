
"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";

export interface AlertMarker {
    id: number;
    lat: number;
    lng: number;
    title: string;
    severity: string;
    region: string;
    state: string;
}

export default function AlertsMap({ markers }: { markers: AlertMarker[] }) {
    console.log(markers);
    return (
        <div className="h-[500px] w-full">
            <MapContainer
                {...({ center: [20.5937, 78.9629], zoom: 5, style: { height: "100%", width: "100%" } } as any)}
            >
                <TileLayer
                    {...({ url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "&copy; OpenStreetMap contributors" } as any)}
                />
                {markers.map((m) => {
                    // Choose icon based on severity (case-insensitive)
                    const severity = m.severity?.toLowerCase();
                    const iconUrl =
                        severity === "high" || severity === "extreme"
                            ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
                            : severity === "moderate"
                                ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png"
                                : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";
                    const icon = new Icon({
                        iconUrl,
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                    });

                    return (
                        <Marker key={m.id} position={[m.lat, m.lng]} icon={icon}>
                            <Popup>
                                <strong>{m.title}</strong> <br />
                                {m.region}, {m.state} <br />
                                Lat: {m.lat.toFixed(2)} <br />
                                Lng: {m.lng.toFixed(2)} <br />
                                Severity: {m.severity}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

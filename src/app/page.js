'use client'

// Import packages
import Script from "next/script"
import initMap from './components/map';
import Panel from './components/right';
import Info from './components/info';
import { useRef, useState } from "react";

// Main components
export default function Home() {
  const modalRef = useRef(null);
  const [ modalMessage, setModalMessage ] = useState('Loading image...');
  const [ coord, setCoord ] = useState(null);

  return (
    <>
      <Info />

      <Canvas modalRef={modalRef} modalMessage={modalMessage} setModalMessage={setModalMessage} />

      <Panel modalRef={modalRef} coord={coord} />

      <Script 
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""
        onLoad={() => initMap('map', modalRef, setCoord)}
      />
    </>
  )
}

// Main canvas
function Canvas(prop) {
  const { modalRef, modalMessage} = prop;

  return (
    <div style={{ flex: 10 }} className="flexible">

      <dialog id='map-loading' ref={modalRef}>
        <div className="flexible vertical center1 center2 center3">
          {modalMessage}
        </div>
      </dialog>

      <div id='map' />

    </div>
  )
}
import React, { useState } from "react";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const { t } = useTranslation();
    const [roomSearchResults, setRoomSearchResults] = useState([]);

    // Function to handle search results
    const handleSearchResult = (results) => {
        setRoomSearchResults(results);
    };

    return (
        <div className="home">
            {/* HEADER / BANNER ROOM SECTION */}
            <section>
                <header className="header-banner">
                    <img src="./assets/images/hotel.webp" alt="Phegon Hotel" className="header-image" />
                    <div className="overlay"></div>
                    <div className="animated-texts overlay-content">
                        <h1>
                            <span className="phegon-color">Phegon Hotel</span>
                        </h1><br />
                        <h3>{t('home.stepInto')}</h3>
                    </div>
                </header>
            </section>

            {/* SEARCH/FIND AVAILABLE ROOM SECTION */}
            <RoomSearch handleSearchResult={handleSearchResult} />
            <RoomResult roomSearchResults={roomSearchResults} />

            <h4><Link className="view-rooms-home" to="/rooms">{t('home.allRooms')}</Link></h4>

            <h2 className="home-services">{t('home.services')} <span className="phegon-color">Phegon Hotel</span></h2>

            {/* SERVICES SECTION */}
            <section className="service-section"><div className="service-card">
                <img src="./assets/images/ac.png" alt="Air Conditioning" />
                <div className="service-details">
                    <h3 className="service-title">{t('home.ac')}</h3>
                    <p className="service-description">{t('home.acDesc')}</p>
                </div>
            </div>
                <div className="service-card">
                    <img src="./assets/images/mini-bar.png" alt="Mini Bar" />
                    <div className="service-details">
                        <h3 className="service-title">{t('home.minibar')}</h3>
                        <p className="service-description">{t('home.minibarDesc')}</p>
                    </div>
                </div>
                <div className="service-card">
                    <img src="./assets/images/parking.png" alt="Parking" />
                    <div className="service-details">
                        <h3 className="service-title">{t('home.parking')}</h3>
                        <p className="service-description">{t('home.parkingDesc')}</p>
                    </div>
                </div>
                <div className="service-card">
                    <img src="./assets/images/wifi.png" alt="WiFi" />
                    <div className="service-details">
                        <h3 className="service-title">{t('home.wifi')}</h3>
                        <p className="service-description">{t('home.wifiDesc')}</p>
                    </div>
                </div>

            </section>
            {/* AVAILABLE ROOMS SECTION */}
            <section>

            </section>
        </div>
    );
}

export default HomePage;

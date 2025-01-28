import React from "react";
import heroimg from "../assets/cup.png";

const Home = () => {
    return (
        <div className="home page-bg">
            <div className="hero-text">
                <h1>Learn. Code. Share.</h1>
                <h5>COSC Merch for Open Source Enthusiasts</h5>
            </div>
            <div className="hero-img">
                <img src={heroimg} alt="" />
            </div>
        </div>
    );
};

export default Home;

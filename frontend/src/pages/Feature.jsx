import React from 'react';
// import { Link } from "react-router-dom";

const Feature = () => {
    return (
        <>
            <div className="container-fluid page-header mb-5 ">
                <div className="container"><br />
                    <h1 className="display-3 mb-3" style={{ fontSize: "60px" }}>Feature</h1>
                    <nav aria-label="breadcrumb ">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><a className="text-body" href="/">Home</a></li>
                            <li className="breadcrumb-item"><a className="text-body" href="/">Pages</a></li>
                            <li className="breadcrumb-item text-dark active" aria-current="page">Feature</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container-fluid py-3">
                <div className="container justify-content-center">
                    <div

                        className="section-header text-center mx-auto mb-5 "
                        style={{ maxWidth: 800 }}
                    >
                        <h1 className="display-5 mb-3">Our Features</h1>
                        <p>Why customers trust us</p>
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-4 d-flex flex-column align-items-center">
                            <img src="img/icon-1.png" className="img-fluid mb-3" alt="Natural process" />
                            <h4>Natural Process</h4>
                        </div>

                        <div className="col-lg-4 d-flex flex-column align-items-center">
                            <img src="img/icon-2.png" className="img-fluid mb-3" alt="Organic products" />
                            <h4>Organic Products</h4>
                        </div>

                        <div className="col-lg-4 d-flex flex-column align-items-center">
                            <img src="img/icon-3.png" className="img-fluid mb-3" alt="Biologically safe" />
                            <h4>Biologically Safe</h4>
                        </div>
                    </div>
                </div>
            </div>
            <br /><br />
        </>
    );
}

export default Feature;
const About = () => {
    return (
        <>
            <div className="container-fluid page-header mb-5 ">
                <div className="container"><br />
                    <h1 className="display-3 mb-3" style={{ fontSize: "60px" }}>About Us</h1>
                    <nav aria-label="breadcrumb ">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><a className="text-body" href="/">Home</a></li>
                            <li className="breadcrumb-item"><a className="text-body" href="/">Pages</a></li>
                            <li className="breadcrumb-item text-dark active" aria-current="page">About Us</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container-xxl py-3">
                <div

                    className="section-header text-center mx-auto mb-5 "
                    style={{ maxWidth: 800 }}
                >
                    <h1 className="display-5 mb-3">About Us</h1>

                </div>
                <div className="container mb-0">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-6">
                            <div className="about-img position-relative overflow-hidden p-5 pe-0">
                                <img className="img-fluid w-100" src="img/about.jpg" alt="Organic Vegetables" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <h1 className="display-5 mb-4">Best Organic Fruits And Vegetables</h1>
                            <p>Fresh and organic food directly from farms.</p>
                            <p>
                                We partner with local farmers to bring sustainable and eco-friendly farming practices
                                straight to your table. From farm to fork, every step is monitored for quality and freshness.
                            </p>
                            <p>
                                Join our community of conscious consumers who value health, sustainability, and
                                premium-quality produce. Experience the natural difference with TS Organic Mall.
                            </p>
                        
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default About;
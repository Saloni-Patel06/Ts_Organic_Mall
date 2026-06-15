import { FaEnvelope } from "react-icons/fa";

const Team = () => {

    const teamMembers = [
        {
            id: 1,
            name: "Tina Rathva",
            // role: "Founder & CEO - TS Organic Mall",
            description: "Leading the organic revolution with fresh produce and sustainable farming practices.",
            email: "tinarathva42@gmail.com",
            image: "/img/tina.png"
        },
        {
            id: 2,
            name: "Saloni Patel",
            // role: "Full Stack Developer - TS Organic Mall",
            description: "Building seamless e-commerce experiences for organic fruits and vegetables delivery.",
            email: "psaloni0610@gmail.com",
            image: "/img/saloni1.jpeg"
        }
    ];

    return (
        <>
            <div className="container-fluid page-header mb-5">
                <div className="container"><br />
                    <h1 className="display-3 mb-3" style={{ fontSize: "60px" }}>Team</h1>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><a className="text-body" href="/">Home</a></li>
                            <li className="breadcrumb-item"><a className="text-body" href="/">Pages</a></li>
                            <li className="breadcrumb-item text-dark active" aria-current="page">Our Team</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container-xxl py-3">
                <div className="section-header text-center mx-auto mb-5" style={{ maxWidth: 800 }}>
                    <h1 className="display-5 mb-3">Meet Our Team</h1>
                </div>
                <div className="row justify-content-center g-5">
                    {teamMembers.map(member => (
                        <div className="col-md-5 col-lg-4" key={member.id}>
                            <div className="team-card text-center p-4">
                                <div className="team-img-wrapper">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="team-img"
                                    />
                                </div>

                                <h4 className="mt-4 fw-bold">{member.name}</h4>
                                <p className="text-primary small fw-semibold">{member.role}</p>
                                <p className="text-muted small px-2">
                                    {member.description}
                                </p>
                                <a
                                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${member.email}&su=Professional Inquiry&body=Hello ${member.name},%0D%0A%0D%0AI would like to connect with you regarding...`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="email-icon"
                                >
                                    <FaEnvelope />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
.team-card{
    background:white;
    border-radius:18px;
    box-shadow:0 6px 25px rgba(0,0,0,0.08);
    transition:0.35s ease;
    position:relative;
    overflow:hidden;
}

.team-card:hover{
    transform:translateY(-12px);
    box-shadow:0 15px 35px rgba(0,0,0,0.12);
}

.team-img-wrapper{
    display:flex;
    justify-content:center;
}

.team-img{
    width:180px;
    height:180px;
    border-radius:50%;
    object-fit:cover;
    border:4px solid #3CB815;
    padding:3px;
    transition:0.3s;
}

.team-card:hover .team-img{
    transform:scale(1.08);
}

.team-btn{
    display:inline-block;
    text-decoration:none;
    border:none;
    background:#3CB815;
    color:white;
    padding:8px 20px;
    border-radius:30px;
    font-size:14px;
    margin-top:12px;
    transition:0.3s;
}

.team-btn:hover{
    opacity:0.9;
    color:white;
}
    .email-icon{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:42px;
    height:42px;
    background:#3CB815;
    color:white;
    border-radius:50%;
    font-size:18px;
    margin-top:12px;
    transition:0.3s ease;
    text-decoration:none;
}

.email-icon:hover{
    background:#3CB815;
    transform:scale(1.1);
    color:white;
}

            `}</style>

        </>
    );
};

export default Team;

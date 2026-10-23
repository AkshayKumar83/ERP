const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const setupMiddleware = (server) => {
    // server.use(cors());
    // server.use(cors({ origin: '*' }));
const allowOrigins = ["http://192.168.1.117:5173", "http://192.168.1.117:4173", "http://localhost:5173","http://localhost:4173",
        "http://ec2-13-235-80-101.ap-south-1.compute.amazonaws.com:4173", "http://13-235-80-101:4173"
 ]
    server.use(
        cors({
            origin: function(origin, callback){
                if(!origin || allowOrigins.indexOf(origin) !== -1){
                    callback(null, true)
                }else{
                    callback(new Error('Not allowed by cors'))
                }
            }, // Allow your frontend domain
            credentials: true, // Allow cookies (important for session-based auth)
        })
    );

    server.use(bodyParser.json({ limit: "50mb" })); // Adjust "10mb" as needed
    server.use(express.json({ limit: "50mb" })); // Adjust "10mb" as needed
    server.use(cookieParser());
};

module.exports = setupMiddleware;

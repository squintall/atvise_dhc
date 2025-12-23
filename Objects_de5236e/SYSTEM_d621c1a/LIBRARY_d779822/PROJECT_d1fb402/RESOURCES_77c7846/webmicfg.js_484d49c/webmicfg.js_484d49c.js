var webMIConfig = {
"frame.documentdomain": true,
"data.keepaliveinterval": 30000,  
"data.requesttimeout": 30000,          
"frame.scaletype": "transform",
"responsiveLite": {
        "active": true,
        "config": {
            "mobile": true,
            "tablet": false,
            "desktop": true,
            "forceDevice": "",
            "forceTouch": true,
            "ignoreTouch": false,
            "portrait": {
                "active": true,
                "thresholdMobile": 850,
                "thresholdDesktop": 1080
            },
            "landscape": {
                "active": false,
                "thresholdMobile": 1,
                "thresholdDesktop": 1250
            }
        },
        "deviceScaling": {
            "desktop": {
                "window": {
                    "content": 1.0,
                    "titlebar": 1.0
                },
                "table": {
                    "fontsize": 1.0,
                    "rowheight": 1.0
                },
                "contextmenu": {
                    "fontsize": 1.0,
                    "rowheight": 1.0
                }
            },
            "tablet": {
                "window": {
                    "content": 1.5,
                    "titlebar": 1.5
                },
                "table": {
                    "fontsize": 1.1,
                    "rowheight": 1.5
                },
                "contextmenu": {
                    "fontsize": 1.1,
                    "rowheight": 1.5
                }
            },
            "mobile": {
                "window": {

                    "content": 1.5,
                    "titlebar": 1.5
                },
                "table": {
                    "fontsize": 1.5,
                    "rowheight": 2.0
                },
                "contextmenu": {
                    "fontsize": 2,
                    "rowheight": 2.0
                }
            }
        }
        }
};

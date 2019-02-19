var app = new Vue({
    el: "#app",
    data: {
        "games": [],
        "rows": [],
        "teamTable": [],
        "showSchedule": false,
        "fullTable": true,
        "teamFilter": false,
        currentView: "index",
        currentMap: '',
        "newTeamArray": [],
        "date": '',
        selectedTeam: '',
        "time": [],
        "locations": '',
        "address": '',
        allTeams: [],
        teams: [],
        currentLocation: '',
        currentTeamChat: '',
        logos: [],
        locationPageInfo: [],
        locationPageLocation: '',
        locationPageLink: '',
        locationPageAddress: [],
        currentChat: '',
        posts: [],
        userLoged: false,
        loadingPost: false,
        "link": '',
        teams: ["U1", "U2", "U3", "U4", "U5", "U6"],
        "team1": '',
        "team2": '',
    },
    created() {
        this.dataTable();
        this.userLoged = false;
        
    },
    methods: {

        dataTable: function (link) {
            var fetchConfig =
                fetch("https://api.myjson.com/bins/zpyv2", {
                    method: "GET",

                })
                .then(function (response) {
                    return response.json();

                })
                .then(function (data) { 
                    app.games = data.games;
                    app.allTeams = data.teams[0].team;
                    app.locationPageInfo = data.links[0].map;
                    app.updateInfo(data.games);
                })
                .catch(error => alert(error));
        },
        updateInfo: function (data) {
            let games = data;
            let rows = [];
            for (var i = 0; i < games.length; i++) {

                rows.push(games[i].round1);
                if (games[i].round2 != null) {
                    rows.push(games[i].round2);
                }
                this.rows = rows;
            }

        },
        setCurrentView(view) {
            this.currentView = view;
        },
        setCurrentViewChat(view,team) {
            this.setCurrentView(view);
            this.currentTeamChat = team;
            
            
        },
        setCurrentMap(view, game) {
            this.currentView = view;
            this.locationPageLink = [];
            let newArray = [];
            let linkArray = [];
            let locationArray = [];
            let addressArray = [];

            for (let i = 0; i < app.locationPageInfo.length; i++) {
                if (app.locationPageInfo[i].location == game) {
                    locationArray.push(app.locationPageInfo[i].location);
                    linkArray.push(app.locationPageInfo[i].link);
                    addressArray.push(app.locationPageInfo[i].address);

                }

            }
            this.locationPageAddress = addressArray["0"];
            this.locationPageLocation = locationArray["0"];
            this.locationPageLink = linkArray["0"];

        },
        isLoged: function () {
            firebase.auth().onAuthStateChanged(function (user) {
                if (user != null) {
                    console.log("user signed in")
                    app.userLoged = true;
                    app.getPost();
                    
                } else {
                    app.userLoged = false;
                }
            });    
        },
        login: function (chat) {
            var provaider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provaider);
            app.loadingPost = true;
            app.currentChat = chat;
            this.isLoged();            
        },
        logout: function () {
            firebase.auth().signOut();
            app.userLoged = false;

        },
        writeNewPost: function (chat) {
            app.currentChat = chat;
            if (!$("#write-txt").val()) {
                return
            }
            const textToPost = document.getElementById("write-txt").value;
            const userName = firebase.auth().currentUser.displayName;
            const userImage = firebase.auth().currentUser.photoURL;
            const userEmail = firebase.auth().currentUser.email;
            let dataToPost = {
                username: userName,
                text: textToPost,
                email: userEmail,
                image: userImage,
                
            };
            const newPost = firebase.database().ref().child(app.currentChat).push().key;
            let updates = {};
            updates["/"+app.currentChat+"/" + newPost] = dataToPost;
            document.getElementById("write-txt").value = "";
            return firebase.database().ref().update(updates);
  
        },
        getPost: function () {  
            let currentChat = app.currentChat
            firebase.database().ref(currentChat).on("value", function (data) {
                const logs = document.getElementById("chat-window");
                const userEmail = firebase.auth().currentUser.email;
                let posts = data.val();
                let allChatPosts = [];
                for (let key in posts) {
                    let element = posts[key];
                    console.log(element)
                    if (element.email == userEmail) {
                        element["user"] = "host-post";
                    } else {
                        element["user"] = "other-post";
                    }
                    allChatPosts.push(element);
                }
                app.posts = allChatPosts;
                setTimeout(function () {
                    $("#chat-window").animate({
                        scrollTop: $("#chat-window").prop("scrollHeight")
                    });
                    app.loadingPost = false;
                }, 500)
            });
        },
        filterTeam: function (team) {
            var allRows, teamSelected;
            app.newTeamArray = [];
            allRows = app.rows;
            for (var i = 0; i < allRows.length; i++) {
                if (allRows[i].team1 == team || allRows[i].team2 == team) {
                    app.newTeamArray.push(allRows[i]);
                }
            }
            app.fullTable = false;
            app.teamFilter = true;
        },
        showFullTable: function () {
            app.teamFilter = false;
            app.fullTable = true;
        },

    }
});
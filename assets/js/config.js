const config = {
    // Basic Profile Information
    name: "Nhat Minh",
    description: "Wish I could turn back the time, back when I was yours and you were mine.",
    location: "Ho Chi Minh City, Vietnam",
    
    // Avatar and Background Images (Use relative paths or external URLs)
    avatar: "assets/images/avatar.gif", 
    background: "assets/images/background.jpg",

    // Lanyard Configuration (Discord Status)
    // To get your ID: Turn on Developer Mode in Discord -> Right click your name -> Copy ID
    // You must join the Lanyard Discord server for the API to work: https://discord.gg/lanyard
    discordID: "780329764132487180", 

    // Manual Badges (If API doesn't show them or you want to add custom ones)
    // Supported values: "nitro", "boost", "hypesquad_bravery", "hypesquad_brilliance", "hypesquad_balance",
    // "bug_hunter_1", "bug_hunter_2", "partner", "staff", "early_supporter", "developer", "active_developer", "moderator"
    //
    // NOTE FOR LOCAL IMAGES:
    // Create folder: assets/images/badges/
    // Save images with corresponding names: nitro.png, boost.png, developer.png, etc.
    manualBadges: ["nitro", "boost"], 

    // Social Media Links
    // icon: FontAwesome class name (https://fontawesome.com/search)
    socials: [
        { icon: "fa-brands fa-facebook", link: "https://www.facebook.com/withoutminh" },
        { icon: "fa-brands fa-instagram", link: "https://www.instagram.com/withoutminh/" },
        { icon: "fa-brands fa-spotify", link: "https://open.spotify.com/user/31x3hcvi5kdy66da4wuh5olo3nja" },
        { icon: "fa-brands fa-github", link: "https://github.com/withoutminh" },
        { icon: "fa-brands fa-steam", link: "https://steamcommunity.com/id/minhuwu2210/" },
    ],

    // Music Playlist (Limit to 5 songs for best performance)
    musicList: [
        {
            name: "About You",
            artist: "The 1975",
            src: "assets/audio/about_you.mp3",
            cover: "assets/audio/about_you.jpg" // Optional: Song specific cover art
        },
        {
            name: "Dạo Này",
            artist: "Obito",
            src: "assets/audio/dao_nay.mp3",
            cover: "assets/audio/dao_nay.jpg"
        },
        {
            name: "Không Buông",
            artist: "HNGLE",
            src: "assets/audio/khong_buong.mp3",
            cover: "assets/audio/khong_buong.jpg"
        },
        {
            name: "Thôi Em Đừng Đi",
            artist: "MCK",
            src: "assets/audio/thoi_em_dung_di.mp3",
            cover: "assets/audio/thoi_em_dung_di.jpg"
        },
        {
            name: "Vết Thương",
            artist: "fishy",
            src: "assets/audio/vet_thuong.mp3",
            cover: "assets/audio/vet_thuong.jpg"
        }
    ]
};

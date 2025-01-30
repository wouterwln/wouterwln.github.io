// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-home",
    title: "Home",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "Publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "Projects",
          description: "My projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-repositories",
          title: "Repositories",
          description: "Overview of open source projects I have been a part of.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-resume",
          title: "Resume",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "projects-futsal-team-simulator",
          title: 'Futsal Team Simulator',
          description: "Simulating player attendance for optimal team size",
          section: "Projects",handler: () => {
              window.location.href = "/projects/team-sim/";
            },},{id: "projects-ai-art-generation",
          title: 'AI Art Generation',
          description: "Exploring creative AI techniques for art generation",
          section: "Projects",handler: () => {
              window.location.href = "/projects/AI-art-init/";
            },},{id: "projects-american-psycho-business-card-generator",
          title: 'American Psycho Business Card Generator',
          description: "Web app to generate business cards in the style of American Psycho",
          section: "Projects",handler: () => {
              window.location.href = "/projects/americ-psych/";
            },},{id: "projects-rxenvironments-jl",
          title: 'RxEnvironments.jl',
          description: "A Julia package for designing Active Inference environments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/rxenvironments/";
            },},{id: "projects-johnny-cash-a-bayesian-football-betting-bot",
          title: 'Johnny Cash: A Bayesian Football Betting Bot',
          description: "Improving TrueSkill for football match prediction",
          section: "Projects",handler: () => {
              window.location.href = "/projects/trueskill-betting/";
            },},{id: "projects-learning-real-life-football-tactics",
          title: 'Learning Real-Life Football Tactics',
          description: "Using Active Inference to learn optimal football strategies",
          section: "Projects",handler: () => {
              window.location.href = "/projects/football-tactics/";
            },},{id: "projects-rxinfer-jl-3-0-powered-by-graphppl",
          title: 'RxInfer.jl 3.0 powered by GraphPPL',
          description: "Nested Model specification with next-gen PPL",
          section: "Projects",handler: () => {
              window.location.href = "/projects/graphppl/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%77.%77.%6C.%6E%75%69%6A%74%65%6E@%74%75%65.%6E%6C", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/wouterwln", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/wouter-nuijten-476830a6", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0009-0007-0689-9300", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=wCu4lj8AAAAJ", "_blank");
        },
      },{
        id: 'social-x',
        title: 'X',
        section: 'Socials',
        handler: () => {
          window.open("https://twitter.com/wouterwln", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];

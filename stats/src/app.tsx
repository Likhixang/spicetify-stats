import React from "react";
import useNavigationBar from "spcr-navigation-bar";
import ArtistsPage from "./pages/top_artists";
import TracksPage from "./pages/top_tracks";
import GenresPage from "./pages/top_genres";
import LibraryPage from "./pages/library";
import ChartsPage from "./pages/charts";
import AlbumsPage from "./pages/top_albums";
import { STATS_VERSION, LATEST_RELEASE } from "./constants";

import "./styles/app.scss";
import "../../shared/config/config_modal.scss";

const pages: Record<string, React.ReactElement> = {
    ["Artists"]: <ArtistsPage />,
    ["Tracks"]: <TracksPage />,
    ["Albums"]: <AlbumsPage />,
    ["Genres"]: <GenresPage />,
    ["Library"]: <LibraryPage />,
    ["Charts"]: <ChartsPage />,
};

const checkForUpdates = (setNewUpdate: (a: boolean) => void) => {
    fetch(LATEST_RELEASE)
        .then((res) => res.json())
        .then(
            (result) => {
                try {
                    setNewUpdate(result[0].name.slice(1) !== STATS_VERSION);
                } catch (err) {
                    console.log(err);
                }
            },
            (error) => {
                console.log("Failed to check for updates", error);
            }
        );
};

const App = () => {
    const [config, setConfig] = React.useState({ ...SpicetifyStats.ConfigWrapper.Config });

    const launchModal = () => {
        SpicetifyStats.ConfigWrapper.launchModal(setConfig);
    };

    const configWrapper = {
        CONFIG: config,
        launchModal,
    };

    const tabPages = ["Artists", "Tracks", "Albums", "Genres", "Library", "Charts"].filter(
        (page) => configWrapper.CONFIG[`show-${page.toLowerCase()}`]
    );

    const [navBar, activeLink, setActiveLink] = useNavigationBar(tabPages);
    const [hasPageSwitched, setHasPageSwitched] = React.useState(false); // TODO: edit spcr-navigation-bar to include initial active link
    const [newUpdate, setNewUpdate] = React.useState(false);

    React.useEffect(() => {
        setActiveLink(Spicetify.LocalStorage.get("stats:active-link") || "Artists");
        checkForUpdates(setNewUpdate);
        setHasPageSwitched(true);
    }, []);

    React.useEffect(() => {
        Spicetify.LocalStorage.set("stats:active-link", activeLink);
    }, [activeLink]);

    if (!hasPageSwitched) {
        return <></>;
    }

    return (
        <>
            {newUpdate && (
                <div className="new-update">
                    New app update available! Visit{" "}
                    <a href="https://github.com/harbassan/spicetify-stats/releases">harbassan/spicetify-stats</a> to
                    install.
                </div>
            )}
            {navBar}
            {React.cloneElement(pages[activeLink], { config: configWrapper })}
        </>
    );
};

export default App;
import Feed from "../Feed";
import Sidebar from "../Sidebar";
import FollowersList from "../FollowersList";
import Navbar from "../Navbar";
import "../../css/Feed.css";

import { getGroup } from "../utils/groups"
import { useAuthorization } from "../Authorization";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";


const Group = () => {
    const [data, setData] = useState(null)
    let { id } = useParams();

    const isAuthorized = useAuthorization();

    // const data = await getGroups();

    useEffect(() => {
        async function fetchData() {
            const response = await getGroup(id);
            setData(response)
            console.warn(response);
        }

        fetchData();
    }, [])

    if (isAuthorized) {
        return (
            <>
                <Navbar />
                <Sidebar />

                <div className="Feed feed-container">
                <h1>{data.Name}</h1>
                <h2>{data.Owner}</h2>
                <h3>{data.Description}</h3>
                <h4>{data.Date}</h4>
                </div>

                <FollowersList />


            </>
        );
    }
};

export default Group;

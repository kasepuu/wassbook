import "../../css/Feed.css";
import { Posts } from "./Posts";

import { getGroup } from "../utils/groups";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Group = () => {
  const [data, setData] = useState({ Posts: [], Members: [], Events: [] });
  let { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      const response = await getGroup(id);
      setData(response);
      console.warn(response);
    }

    fetchData();
  }, []);

  return (
    <>
      <div className="Feed feed-container">
        <div className="group-menu">
          <span>discussion |</span>
          <span>people |</span>
          <span>events |</span>
        </div>

        <h1>{data.Name}</h1>
        <h2>{data.Owner}</h2>
        <h3>{data.Description}</h3>
        <h4>{data.Date}</h4>

        <Posts posts={data.Posts} />
      </div>
    </>
  );
};

export default Group;

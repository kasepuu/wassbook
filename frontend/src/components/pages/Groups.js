/// TODO Kuvada membereid Grupi lehel
// TODO  Võimalus teha postitusi grupi lehel
// TODO Kuvada postitusi üldiselt grupi lehel


import Feed from "../Feed";
import Sidebar from "../Sidebar";
import FollowersList from "../FollowersList";
import Navbar from "../Navbar";
import "../../css/Feed.css";

import { getGroups, createGroup } from "../utils/groups"
import { useAuthorization } from "../Authorization";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

const Groups = () => {
  const [data, setData] = useState(null)
  const isAuthorized = useAuthorization();


  useEffect(() => {
    async function fetchData() {
      const response = await getGroups();
      setData(response)
      console.warn(response);
    }

    fetchData();
  }, [])


  const onSubmit = async (data) => {

    let response = await createGroup(data)

    if (response.status != 201) {
      console.error(await response.json())

      return
    }
    setData(await response.json())
    console.log("Group created")

  }
  const { register, handleSubmit } = useForm();

  if (isAuthorized) {
    return (
      <>
        <Navbar />
        <Sidebar />


        <div className="Feed feed-container">
          <h1>Groups</h1>

          {data.map(group => (
            <Link to={"/groups/" + group.Id}>
              <p key={group.Id}>{group.Name}</p>
            </Link>
          ))
          }


          <h1>Create group</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-control">
              <label>Name</label>
              <input type="text" name="name" {...register("name")} />
            </div>
            <div className="form-control">
              <label>Description</label>
              <input type="text" name="description" {...register("description")} />
            </div>

            <div className="form-control">
              <label></label>
              <button type="submit">Submit</button>
            </div>
          </form>
        </div>


        <FollowersList />
      </>
    );
  }
};

export default Groups;

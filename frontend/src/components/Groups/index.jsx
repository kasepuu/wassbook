/// TODO Kuvada membereid Grupi lehel
// TODO  Võimalus teha postitusi grupi lehel
// TODO Kuvada postitusi üldiselt grupi lehel

import Post from "./Post";
import "../../css/Feed.css";
import "../../css/Groups.css"

import { getGroups, createGroup } from "../utils/groups";
import { createComment } from "../utils/groups";


import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));

const Groups = () => {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);


  useEffect(() => {
    async function fetchData() {

      const response = await getGroups(userInfo.UserID);
      setGroups(response.Groups)
      setPosts(!response.Posts ? []:response.Posts )      
    }

    fetchData();
  }, []);

  const onSubmit = async (data) => {
    let response = await createGroup(data);

    if (response.status != 201) {
      console.error(await response.json());

      return;
    }
    setGroups(await response.json());
    console.log("Group created");
  };
  const { register, handleSubmit } = useForm();


  const handleCommentSubmit=  async (data, post) => {    
    data.append("userId", userInfo.UserID)
    data.append("postId", post.Id)
    data.append("groupId",post.GroupId )
    let response = await createComment(data);    
    setPosts(response)
  } 

  //TODO vaadata kuidas horisontaalselt scroll korda teha
  return (
    <>
      <div className="Feed feed-container">   
      <h1>Groups</h1>
      <div className="group-names">
        {groups.map(group => (
          <Link to={`/groups/${group.Id}`}>
          <h3>{group.Name}</h3>
          </Link>
        
       ))}
        </div>       
       <h1>Feed</h1>
        <div className="feed-posts" id="feed-posts">
                {posts.map((post) => (
                <Post  key={post.Id} post={post} handleCommentSubmit={handleCommentSubmit}></Post>
              ))}
        </div>   
        <h1>Create group</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-control">
            <label>Name</label>
            <input type="text" name="name" {...register("name")} />
          </div>
          <div className="form-control">
            <label>Description</label>
            <input
              type="text"
              name="description"
              {...register("description")}
            />
          </div>

          <div className="form-control">
            <label></label>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
        </>
  );
};

export default Groups;

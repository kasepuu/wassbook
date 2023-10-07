const host = `http://${window.location.hostname}:8081`;

export const getGroups = async (id) => {
  const response = await fetch(`${host}/groups/${id}`);

  switch (response.status) {
    case 200:
      let groups = await response.json();
      return groups;
    case 401:
      console.log("ERR");
  }
};

export const getGroup = async (id) => {
  const response = await fetch(`${host}/group/${id}`);

  switch (response.status) {
    case 200:
      let group = await response.json();
      return group;
    case 401:
      console.log("ERR");
  }
};

export const createGroup = async (data) => {
  const response = await fetch(`${host}/creategroup`, {
    method: "POST",
    body: data,
  });

  switch (response.status) {
    case 201:
      let data = await response.json();
      return data;
    default:
      console.log("ERR");
  }
};

export const createComment = async (comment) => {
  const response = await fetch(`${host}/groups/comments`, {
    method: "POST",
    body: comment,
  });

  switch (response.status) {
    case 201:
      let data = await response.json();
      return data;
    case 401:
      console.log("ERR");
  }
};

export const createPost = async (post) => {
  const response = await fetch(`${host}/groups/posts`, {
    method: "POST",
    body: post,
  });

  switch (response.status) {
    case 201:
      let data = await response.json();
      return data;
    case 401:
      console.log("ERR");
  }
};

export const invitedMembers = async (formData) => {
  const response = await fetch(`${host}/groups/invited`, {
    method: "POST",
    body: formData,
  });

  switch (response.status) {
    case 201:
      let data = await response.json();
      return data;
    case 401:
      return [];
  }
};

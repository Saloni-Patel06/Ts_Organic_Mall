const getImage = (path) => {
  return process.env.PUBLIC_URL + (path.startsWith("/") ? path : "/" + path);
};

export default getImage;
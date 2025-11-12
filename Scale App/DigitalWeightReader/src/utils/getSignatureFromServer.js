const getSignatureFromServer = async () => {
  const response = await fetch('http://192.168.0.115:5172/api/imagekit/get-signature');
  const data = await response.json();
  return data;
};

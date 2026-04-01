import http from "k6/http";
import { sleep } from 'k6';

const tokens = [
  __ENV.TEST_TOKEN_1,
  __ENV.TEST_TOKEN_2
];

const Ids = [
  '6608d0e9772ed4924311c47c',
  '69c31468b6de010d6fb2d9a8',
  '69381b1bf308b954f3cce4c8',
  '69380d969b4f9c40cb8a5de7',
  '66907be5c71f53f3d27f1f4a',
  '6609eb30479876a687109527'
]


export const options = {
    vus: 400,
    duration: "30s"
};
export default () => {
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const ID = Ids[Math.floor(Math.random() * Ids.length)];

  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
    http.get(`http://127.0.0.1:5000/find?_id=${ID}`, params)
    sleep(1);

};
// src/utils/taiwan-regions.js
// 兩層結構：大區域 → 縣市（適合 el-cascader）
// value 使用簡短代碼，方便後端或查表

export const taiwanRegions = [
  {
    label: "北部",
    value: "north",
    children: [
      { label: "台北市", value: "tpe" },
      { label: "新北市", value: "ntp" },
      { label: "基隆市", value: "kee" },
      { label: "桃園市", value: "tyn" },
      { label: "新竹市", value: "hsc" },
      { label: "新竹縣", value: "hsq" },
      { label: "宜蘭縣", value: "ila" },
    ],
  },
  {
    label: "中部",
    value: "central",
    children: [
      { label: "台中市", value: "txg" },
      { label: "苗栗縣", value: "mia" },
      { label: "彰化縣", value: "cha" },
      { label: "南投縣", value: "nan" },
      { label: "雲林縣", value: "yun" },
    ],
  },
  {
    label: "南部",
    value: "south",
    children: [
      { label: "台南市", value: "tnn" },
      { label: "高雄市", value: "khh" },
      { label: "嘉義市", value: "cyi" },
      { label: "嘉義縣", value: "cyc" },
      { label: "屏東縣", value: "pif" },
    ],
  },
  {
    label: "東部",
    value: "east",
    children: [
      { label: "花蓮縣", value: "hul" },
      { label: "台東縣", value: "ttt" },
    ],
  },
  {
    label: "離島",
    value: "islands",
    children: [
      { label: "澎湖縣", value: "phh" },
      { label: "金門縣", value: "kmm" },
      { label: "連江縣", value: "lcc" }, // 馬祖
    ],
  },
];

export const taiwanCities = taiwanRegions.flatMap(g => g.children);

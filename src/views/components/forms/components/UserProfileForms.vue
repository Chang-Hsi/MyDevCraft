<template>
  <div class="space-y-4">
    <!-- 個人資料 -->
    <el-card shadow="never">
      <template #header><b>個人資料（Profile）</b></template>
      <el-form ref="profileRef" :model="profile" :rules="profileRules" label-width="90px">
        <el-form-item>
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="onAvatarChange"
          >
            <img
              v-if="profile.avatar"
              :src="profile.avatar"
              class="w-20 h-20 rounded-full object-cover"
            />
            <div
              v-else
              class="w-20 h-20 rounded-full bg-gray-100 grid place-items-center text-gray-400"
            >
              上傳
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="profile.name" />
        </el-form-item>
        <el-form-item label="暱稱">
          <el-input v-model="profile.nickname" />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker v-model="profile.birthday" type="date" placeholder="選擇日期" />
        </el-form-item>
        <el-form-item label="性別">
          <el-radio-group v-model="profile.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="語系 / 時區">
          <div class="flex gap-2">
            <el-select v-model="profile.locale" class="!w-40">
              <el-option label="繁中" value="zh-TW" />
              <el-option label="簡中" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
            <el-select v-model="profile.tz" class="!w-56" filterable>
              <el-option label="UTC+8 Taipei" value="Asia/Taipei" />
              <el-option label="UTC+9 Tokyo" value="Asia/Tokyo" />
              <el-option label="UTC-8 Los Angeles" value="America/Los_Angeles" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveProfile">儲存</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 聯絡方式 -->
    <el-card shadow="never">
      <template #header><b>聯絡方式</b></template>
      <el-form ref="contactRef" :model="contact" :rules="contactRules" label-width="90px">
        <el-form-item label="Email" prop="email">
          <el-input v-model="contact.email" />
        </el-form-item>
        <el-form-item label="手機" prop="phone">
          <el-input v-model="contact.phone" placeholder="+886912345678" />
        </el-form-item>
        <el-form-item label="備用信箱">
          <el-input v-model="contact.backupEmail" />
        </el-form-item>
        <el-form-item label="緊急聯絡">
          <el-input v-model="contact.emergency" placeholder="姓名 / 電話" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveContact">儲存</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- KYC（簡化） -->
    <el-card shadow="never">
      <template #header><b>KYC / 實名認證（示意）</b></template>
      <el-form :model="kyc" label-width="100px" ref="kycRef" :rules="kycRules">
        <el-form-item label="國籍" prop="country">
          <el-select v-model="kyc.country" class="!w-56" filterable>
            <el-option label="Taiwan" value="TW" />
            <el-option label="Japan" value="JP" />
            <el-option label="United States" value="US" />
          </el-select>
        </el-form-item>
        <el-form-item label="證件類型" prop="docType">
          <el-select v-model="kyc.docType" class="!w-56">
            <el-option label="護照" value="passport" />
            <el-option label="身分證" value="id" />
            <el-option label="駕照" value="driver" />
          </el-select>
        </el-form-item>
        <el-form-item label="證件號" prop="docNo">
          <el-input v-model="kyc.docNo" />
        </el-form-item>
        <el-form-item label="證件影像" prop="images">
          <el-upload drag action="#" :auto-upload="false" :limit="2" accept="image/*">
            <i class="el-icon--upload" />
            <div class="el-upload__text">拖曳或 <em>點此上傳</em></div>
            <template #tip>
              <div class="el-upload__tip">請上傳正反面照片（JPG/PNG，&lt; 5MB）</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitKYC">送出審核</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";

/* Profile */
const profileRef = ref();
const profile = reactive({
  avatar: "",
  name: "",
  nickname: "",
  birthday: "",
  gender: "male",
  locale: "zh-TW",
  tz: "Asia/Taipei",
});
const profileRules = {
  name: [{ required: true, message: "請輸入姓名", trigger: "blur" }],
  birthday: [{ required: true, message: "請選擇生日", trigger: "change" }],
};
const onAvatarChange = (file) => {
  const reader = new FileReader();
  reader.onload = () => (profile.avatar = reader.result);
  reader.readAsDataURL(file.raw);
};
const saveProfile = () => {
  profileRef.value.validate((ok) => ok && ElMessage.success("已儲存（demo）"));
};

/* Contact */
const contactRef = ref();
const contact = reactive({ email: "", phone: "", backupEmail: "", emergency: "" });
const contactRules = {
  email: [
    { required: true, message: "請輸入 Email", trigger: "blur" },
    { type: "email", message: "格式不正確", trigger: ["blur", "change"] },
  ],
  phone: [
    { required: true, message: "請輸入手機", trigger: "blur" },
    {
      validator: (_, v, cb) =>
        /^\+?[1-9]\d{7,14}$/.test(v) ? cb() : cb(new Error("E.164 格式")),
      trigger: ["blur", "change"],
    },
  ],
};
const saveContact = () => {
  contactRef.value.validate((ok) => ok && ElMessage.success("已儲存（demo）"));
};

/* KYC */
const kycRef = ref();
const kyc = reactive({ country: "", docType: "", docNo: "", images: [] });
const kycRules = {
  country: [{ required: true, message: "必填", trigger: "change" }],
  docType: [{ required: true, message: "必填", trigger: "change" }],
  docNo: [{ required: true, message: "必填", trigger: "blur" }],
  images: [], // 上傳元件自行限制
};
const submitKYC = () => {
  kycRef.value.validate((ok) => ok && ElMessage.success("已送出（demo）"));
};
</script>

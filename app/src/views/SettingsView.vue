<script setup>
import { reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  image: auth.user?.image || '',
  username: auth.user?.username || '',
  bio: auth.user?.bio || '',
  email: auth.user?.email || '',
  password: '',
});

watch(
  () => auth.user,
  (user) => {
    if (user) {
      form.image = user.image || '';
      form.username = user.username;
      form.bio = user.bio || '';
      form.email = user.email;
      form.password = '';
    }
  },
);

const onSubmit = async () => {
  const payload = { ...form };
  if (!payload.password) delete payload.password;
  await auth.updateSettings(payload);
};

const logout = () => {
  auth.logout();
  router.push('/');
};
</script>

<template>
  <div class="settings-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Your Settings</h1>

          <ul v-if="auth.authErrors.length" class="error-messages">
            <li v-for="err in auth.authErrors" :key="err">{{ err }}</li>
          </ul>

          <form @submit.prevent="onSubmit">
            <fieldset class="form-group">
              <input class="form-control" type="text" placeholder="URL of profile picture" v-model="form.image" />
            </fieldset>
            <fieldset class="form-group">
              <input class="form-control form-control-lg" type="text" placeholder="Your Name" v-model="form.username" required />
            </fieldset>
            <fieldset class="form-group">
              <textarea class="form-control form-control-lg" rows="8" placeholder="Short bio about you" v-model="form.bio"></textarea>
            </fieldset>
            <fieldset class="form-group">
              <input class="form-control form-control-lg" type="email" placeholder="Email" v-model="form.email" required />
            </fieldset>
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="password"
                placeholder="New Password"
                v-model="form.password"
              />
            </fieldset>
            <button class="btn btn-lg btn-primary pull-xs-right" type="submit">Update Settings</button>
          </form>

          <hr />

          <button class="btn btn-outline-danger" @click="logout">Or click here to logout.</button>
        </div>
      </div>
    </div>
  </div>
</template>

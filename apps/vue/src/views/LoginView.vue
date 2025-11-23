<script setup>
import { ref } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { useAuthStore } from '../store/auth';

const email = ref('');
const password = ref('');
const loading = ref(false);
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const onSubmit = async () => {
  loading.value = true;
  try {
    await auth.login({ email: email.value, password: password.value });
    router.push(route.query.redirect || '/');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Sign in</h1>
          <p class="text-xs-center">
            <RouterLink to="/register">Need an account?</RouterLink>
          </p>

          <ul v-if="auth.authErrors.length" class="error-messages">
            <li v-for="err in auth.authErrors" :key="err">{{ err }}</li>
          </ul>

          <form @submit.prevent="onSubmit">
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="email"
                placeholder="Email"
                v-model="email"
                required
              />
            </fieldset>
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="password"
                placeholder="Password"
                v-model="password"
                required
              />
            </fieldset>
            <button class="btn btn-lg btn-primary pull-xs-right" :disabled="loading" type="submit">Sign in</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

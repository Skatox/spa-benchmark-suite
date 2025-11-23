<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const slug = route.params.slug;

const form = reactive({
  title: '',
  description: '',
  body: '',
  tagList: '',
});

const loading = ref(false);
const errors = ref([]);

const loadArticle = async () => {
  if (!slug) return;
  loading.value = true;
  try {
    const article = await api.getArticle(slug);
    form.title = article.title;
    form.description = article.description;
    form.body = article.body;
    form.tagList = article.tagList.join(' ');
  } finally {
    loading.value = false;
  }
};

const onSubmit = async () => {
  loading.value = true;
  errors.value = [];
  try {
    const payload = {
      title: form.title,
      description: form.description,
      body: form.body,
      tagList: form.tagList
        .split(' ')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const article = slug
      ? await api.updateArticle(slug, payload)
      : await api.createArticle(payload);
    router.push({ name: 'article', params: { slug: article.slug } });
  } catch (error) {
    errors.value = api.formatErrors(error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadArticle);
</script>

<template>
  <div class="editor-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-10 offset-md-1 col-xs-12">
          <ul v-if="errors.length" class="error-messages">
            <li v-for="err in errors" :key="err">{{ err }}</li>
          </ul>

          <form @submit.prevent="onSubmit">
            <fieldset>
              <fieldset class="form-group">
                <input
                  class="form-control form-control-lg"
                  type="text"
                  placeholder="Article Title"
                  v-model="form.title"
                  required
                />
              </fieldset>
              <fieldset class="form-group">
                <input
                  class="form-control"
                  type="text"
                  placeholder="What's this article about?"
                  v-model="form.description"
                  required
                />
              </fieldset>
              <fieldset class="form-group">
                <textarea
                  class="form-control"
                  rows="8"
                  placeholder="Write your article (in markdown)"
                  v-model="form.body"
                  required
                ></textarea>
              </fieldset>
              <fieldset class="form-group">
                <input
                  class="form-control"
                  type="text"
                  placeholder="Enter tags"
                  v-model="form.tagList"
                />
                <div class="tag-list"></div>
              </fieldset>
              <button class="btn btn-lg pull-xs-right btn-primary" type="submit" :disabled="loading">
                {{ slug ? 'Update Article' : 'Publish Article' }}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

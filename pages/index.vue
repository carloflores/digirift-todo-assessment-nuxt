<script setup lang="ts">

import { ref } from 'vue'
import { useRoute } from 'vue-router';
import { useHelper } from '~/composables/useHelper'


useHead({
  title: 'Digirift To-do App Login'
})
  

const { api } = useHelper();
const route = useRoute()
const router = useRouter();
const data = reactive({
  email: 'test@example.com',
  password: 'password'
})
const isLoading = ref(false);

const errors = reactive({
  email: '',
  password: '',
})

const login = async () => {
  isLoading.value = true;

  let query = `
     mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            access_token
            email
            name
            token_type
        }
    }
  `

  let variables = data;

  await api(query, variables).then(res => {

    localStorage.setItem('jwt', res.login.access_token)
    localStorage.setItem('user', JSON.stringify(res.login))

    router.push('/todo');

    isLoading.value = false;
  }).catch(err => {
    isLoading.value = false;
  })
}


</script>

<template>
  <v-container>
    <v-row justify="center" align-content="center" class="h-screen">
      <v-col xs="12" sm="7" md="6" lg="5">
        <v-card>
          <v-card-title class="text-center">
            Digirift To-do Login
          </v-card-title>

          <v-card-text>
            <form @submit.prevent="login">
              <v-text-field v-model="data.email" :counter="10" :error-messages="errors.email"
                label="Email Address"></v-text-field>
              <v-text-field type="password" v-model="data.password" :counter="10" :error-messages="errors.password"
                label="Password"></v-text-field>
              <v-btn color="primary" class="w-100" type="submit" :loading="isLoading">
                Login

                <template v-slot:loader>
                  <v-progress-linear indeterminate></v-progress-linear>
                </template>
              </v-btn>
            </form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">

import { onMounted, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useHelper } from '~/composables/useHelper'


useHead({
  title: 'Digirift To-do App'
})

type TASK = {
  id: number,
  title: string,
  status: boolean,
  user_id: number
};

type USER = {
  email: string,
  name: string
};

const { api } = useHelper(); 
const router = useRouter();

const isLoading = ref(false)

const route = useRoute()
const tasks:any = ref([])
const title = ref('')
const currentEditTask:any = ref({
  id: 0
});

const user:any = ref({
  email: '',
  name: ''
})

const totalUnfinishedTasks = computed(() => {
  return tasks.value.filter(v => {
    return !v.status;
  }).length;
})

const totalFinishedTasks = computed(() => {
  return tasks.value.filter(v => {
    return v.status;
  }).length;
})

const getTodos = async () => {
  isLoading.value = true;

  let query = `
     query {
      tasks {
        id
        title
        status
        user_id
      }
    }
  `

  await api(query).then(res => {
    tasks.value = res.tasks;
    isLoading.value = false;
  }).catch(err => {
    isLoading.value = false;
  })
}

const createTask = async () => {

  isLoading.value = true;

  let query = `
    mutation createTask($title: String!) {
        createTask(title: $title) {
            id
            title
            status
            user_id
        }
    }
  `

  let variables = {
    title: title.value
  }

  await api(query, variables).then(res => {
    let newTasks = [...tasks.value, { ...res.createTask }];
    tasks.value = newTasks;
    title.value = '';

    isLoading.value = false;
  }).catch(err => {
    isLoading.value = false;
  })
}

const updateTask = async (task: TASK) => {
  let query = `
    mutation updateTask($title: String!, $id: ID!, $status: Boolean!) {
        updateTask(title: $title, id: $id, status: $status) {
            id
            title
            status
            user_id
        }
    }
  `

  let variables = task

  await api(query, variables)
}

const deleteTask = async (task: TASK) => {
  let query = `
    mutation deleteTask($id: ID!) {
        deleteTask(id: $id) {
            msg
        }
    }
  `

  let variables = task

  await api(query, variables).then(res => {
    getTodos()
  }).catch(err => {
  })
}

const deleteTaskByStatus = async (status: boolean) => {
  let query = `
    mutation deleteTaskByStatus($status: Boolean!) {
        deleteTaskByStatus(status: $status) {
            msg
        }
    }
  `

  let variables = {
    status: status
  }

  await api(query, variables).then(res => {
    getTodos()
  }).catch(err => {
  })
}

const deleteAll = async () => {
  let query = `
    mutation {
        deleteAllTask {
            msg
        }
    }
  `

  await api(query).then(res => {
    getTodos()
  })
}

const toggleStatus = (task: TASK) => {
  task.status = !task.status
  updateTask(task);
}

const toggleEdit = (task: TASK) => {
  if(task.id == 0) {
    updateTask(currentEditTask.value);
    currentEditTask.value = task;
  } else {
    currentEditTask.value = task;
  }
}

const logout = async () => {
  let query = `
     mutation logout {
        logout
      }
  `

  await api(query).then(res => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    router.push('/');
  })
}

onMounted(() => {
  getTodos();

  let userData:any = localStorage.getItem('user');
  user.value = JSON.parse(userData);

  console.log(user.value , ' -- user')

})
</script>

<template>
  <v-container>
    <v-row justify="center" align-content="center" class="h-screen">
      <v-col sm="12" md="10" lg="8">
        <div class="d-flex align-center justify-space-between my-4 px-3 text-white w-100">
          <p>Welcome, {{ user.name }}</p>

          <v-btn size="x-small" color="red" @click="logout()">Logout</v-btn>
        </div>
        <v-card variant="outlined" class="border-thin border-primary bg-grey-lighten-3" rounded="xl">

          <template v-slot:title>
            <div class="d-sm-block d-md-flex text-center justify-space-between w-100 py-3 px-3">
              <div>
                Digirift To-do App
              </div>

              <div class="d-flex justify-space-around">
                <v-chip color="green" class="pe-0">
                  Tasks <v-chip class="ms-2">{{ totalUnfinishedTasks }}</v-chip>
                </v-chip>
                <v-chip @click="deleteTaskByStatus(true)" color="warning" class="mx-2 pe-0">Clear Finished Tasks Tasks
                  <v-chip class="ms-2">{{ totalFinishedTasks }}</v-chip></v-chip>
                <v-chip @click="deleteAll()" color="red" class="pe-0"><v-icon icon="mdi-trash-can"></v-icon> All Tasks
                  <v-chip class="ms-2">{{ tasks.length }}</v-chip></v-chip>
              </div>
            </div>
          </template>

          <v-card-text class="bg-white">

            <div class="text-center" v-if="isLoading">
              <v-progress-circular indeterminate :size="70" class="my-3"></v-progress-circular>
            </div>

            <v-list lines="one" class="bg-white" item-props v-if="!isLoading">
              <v-list-item v-for="(t, n) in tasks" :key="n">
                <div class="d-flex align-center justify-space-between pb-2">
                  <div class="d-flex align-center justify-space-start w-100">
                    <v-btn density="compact" variant="outlined" :icon="t.status ? 'mdi-check' : 'mdi-close'"
                      :color="t.status ? 'success' : 'red'" elevation="0" class="border-thin m-0"
                      @click="toggleStatus(t)" v-if="currentEditTask.id != t.id"></v-btn>

                    <div class="w-100">
                      <p class="ms-4 text-body-1" v-if="currentEditTask.id != t.id">{{ t.title }}</p>
                      <div class="w-100 d-flex align-center pe-5" v-if="currentEditTask.id == t.id">
                        <v-text-field variant="plain" class="w-100 m-0 p-0" v-model="currentEditTask.title"
                          label="New Task Title" rounded="xl" hide-details></v-text-field>
                      </div>
                    </div>
                  </div>

                  <v-btn density="compact" variant="outlined" icon="mdi-check" color="green" elevation="0"
                    class="border-thin m-0" @click="toggleEdit({id: 0, title: '', status: false, user_id: 0})"
                    v-if="currentEditTask.id == t.id"></v-btn>

                  <v-btn density="compact" variant="outlined" icon="mdi-pencil" color="warning" elevation="0"
                    class="border-thin m-0" @click="toggleEdit(t)" v-if="currentEditTask.id != t.id"></v-btn>

                  <v-btn density="compact" variant="outlined" icon="mdi-trash-can" color="red" elevation="0"
                    class="border-thin m-0 ms-2" @click="deleteTask(t)" v-if="currentEditTask.id != t.id"></v-btn>

                </div>
                <v-divider v-if="n != tasks.length - 1"></v-divider>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions class="bg-grey-lighten-3 py-3 px-3">
            <v-text-field rounded="xl" variant="solo" label="New Task" hide-details type="text"
              append-inner-icon="mdi-check" elevation="0" v-model="title" clearable @click:append-inner="createTask()">

            </v-text-field>
          </v-card-actions>

        </v-card>

        <div class="text-center opacity-50 text-white mt-4 text-caption">Token and User Data is stored in Local Storage</div>
      </v-col>
    </v-row>
  </v-container>
</template>

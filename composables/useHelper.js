
import { useRouter } from 'vue-router';

const router = useRouter();

export const useHelper = () => {
  const api = async (query, variables = {}) => {
      const response = await fetch('http://localhost:8001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`, // Include token if needed
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const responseBody = await response.json();

      if (responseBody.errors) {
        console.error('GraphQL errors:', response.errors);


        // Catches the response if the user is not authenticated
        if(responseBody.errors[0].message == "Unauthenticated.") {
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
          
          useNuxtApp().$router.push('/');

        }

        return null;
      }

      return responseBody.data;
  }

  return {
    api
  }
}
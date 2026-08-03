import axios from 'axios';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}

const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
if (storedToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
}

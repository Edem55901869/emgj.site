import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = [import.me](https://import.me)ta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = [import.me](https://import.me)ta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function makeEntity(tableName) {
  return {
    list: async (orderBy = '-created_date', limit = 100) => {
      const ascending = !orderBy.startsWith('-');
      const column = orderBy.replace('-', '');
      const { data, error } = await supabase.from(tableName).select('*').order(column, { ascending }).limit(limit);
      if (error) throw error;
      return data;
    },
    filter: async (filters = {}, orderBy = '-created_date', limit = 100) => {
      const ascending = !orderBy.startsWith('-');
      const column = orderBy.replace('-', '');
      let query = supabase.from(tableName).select('*');
      Object.entries(filters).forEach(([key, value]) => { query = query.eq(key, value); });
      const { data, error } = await query.order(column, { ascending }).limit(limit);
      if (error) throw error;
      return data;
    },
    get: async (id) => {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (payload) => {
      const { data, error } = await supabase.from(tableName).insert([payload]).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id, payload) => {
      const { data, error } = await supabase.from(tableName).update({ ...payload, updated_date: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

async function uploadFile(file, bucket = 'media') {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return { file_url: data.publicUrl };
}

export const base44 = {
  entities: {
    Student:         makeEntity('students'),
    Course:          makeEntity('courses'),
    BlogPost:        makeEntity('blog_posts'),
    BlogComment:     makeEntity('blog_comments'),
    BlogLike:        makeEntity('blog_likes'),
    BlogBookmark:    makeEntity('blog_bookmarks'),
    Group:           makeEntity('groups'),
    GroupMembership: makeEntity('group_memberships'),
    GroupMessage:    makeEntity('group_messages'),
    LibraryDocument: makeEntity('library_documents'),
    Conference:      makeEntity('conferences'),
    Notification:    makeEntity('notifications'),
    Tuition:         makeEntity('tuitions'),
    Bulletin:        makeEntity('bulletins'),
    AdminPassword:   makeEntity('admin_passwords'),
    AdminUser:       makeEntity('admin_users'),
    AdminAction:     makeEntity('admin_actions'),
  },
  auth: {
    redirectToLogin: async (nextUrl) => {
      window.location.href = '/connexion?next=' + encodeURIComponent(nextUrl);
    },
  },
  integrations: {
    Core: { UploadFile: uploadFile }
  }
};

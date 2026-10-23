import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Telephone {
  id: number;
  Nama_User: string;
  Alamat: string;
  No_Telp: string;
  kode_post: string;
  date_time: string;
}

interface TelephoneInput {
  Nama_User: string;
  Alamat: string;
  No_Telp: string;
  kode_post: string;
}

interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

type ViewName = 'telephones' | 'todos';

const API_URL = 'http://localhost:3000/api/Pertemuan6';
const TODOS_URL = 'https://jsonplaceholder.typicode.com/todos';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly http = inject(HttpClient);

  readonly view = signal<ViewName>('telephones');
  readonly telephones = signal<Telephone[]>([]);
  readonly todos = signal<Todo[]>([]);
  readonly query = signal('');
  readonly idLookup = signal('');
  readonly selectedTelephone = signal<Telephone | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly formOpen = signal(false);
  readonly todoFormOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly todoDraft = signal('');
  readonly draft: TelephoneInput = this.emptyDraft();

  readonly filteredTelephones = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('id');
    if (!query) return this.telephones();
    return this.telephones().filter((person) =>
      [person.Nama_User, person.Alamat, person.No_Telp, person.kode_post]
        .some((value) => value.toLocaleLowerCase('id').includes(query)),
    );
  });

  readonly filteredTodos = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('id');
    if (!query) return this.todos();
    return this.todos().filter((todo) => todo.title.toLocaleLowerCase('id').includes(query));
  });

  constructor() {
    this.loadTelephones();
  }

  selectView(view: ViewName): void {
    this.view.set(view);
    this.query.set('');
    this.error.set('');
    this.notice.set('');
    if (view === 'todos' && this.todos().length === 0) this.loadTodos();
  }

  loadTelephones(): void {
    this.loading.set(true);
    this.http.get<Telephone[]>(API_URL).subscribe({
      next: (people) => {
        this.telephones.set(people);
        this.loading.set(false);
        this.error.set('');
      },
      error: () => {
        this.error.set('Backend belum terhubung. Jalankan server backend pada port 3000.');
        this.loading.set(false);
      },
    });
  }

  loadTodos(): void {
    this.loading.set(true);
    this.http.get<Todo[]>(`${TODOS_URL}?_limit=12`).subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.loading.set(false);
        this.error.set('');
      },
      error: () => {
        this.error.set('JSONPlaceholder tidak dapat dihubungi. Periksa koneksi internet.');
        this.loading.set(false);
      },
    });
  }

  findTelephoneById(): void {
    const id = Number(this.idLookup());
    if (!Number.isSafeInteger(id) || id < 1) {
      this.selectedTelephone.set(null);
      this.error.set('Masukkan ID berupa bilangan bulat positif.');
      return;
    }

    this.error.set('');
    this.notice.set('');
    this.http.get<Telephone>(`${API_URL}/${id}`).subscribe({
      next: (person) => {
        this.selectedTelephone.set(person);
        this.notice.set(`Data dengan ID ${id} ditemukan.`);
      },
      error: (response) => {
        this.selectedTelephone.set(null);
        this.error.set(response.status === 404
          ? `Data dengan ID ${id} tidak ditemukan.`
          : 'Data gagal dimuat. Periksa koneksi backend.');
      },
    });
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.setDraft(this.emptyDraft());
    this.formOpen.set(true);
  }

  openEditForm(person: Telephone): void {
    this.editingId.set(person.id);
    this.setDraft({
      Nama_User: person.Nama_User,
      Alamat: person.Alamat,
      No_Telp: person.No_Telp,
      kode_post: person.kode_post,
    });
    this.formOpen.set(true);
  }

  saveTelephone(): void {
    const payload = {
      Nama_User: this.draft.Nama_User.trim(),
      Alamat: this.draft.Alamat.trim(),
      No_Telp: this.draft.No_Telp.trim(),
      kode_post: this.draft.kode_post.trim(),
    };
    const id = this.editingId();
    const request = id === null
      ? this.http.post<Telephone>(API_URL, payload)
      : this.http.put<Telephone>(`${API_URL}/${id}`, payload);

    request.subscribe({
      next: () => {
        this.formOpen.set(false);
        this.selectedTelephone.set(null);
        this.notice.set(id === null ? 'Kontak berhasil ditambahkan.' : 'Kontak berhasil diperbarui.');
        this.loadTelephones();
      },
      error: () => this.error.set('Kontak gagal disimpan. Periksa kembali data dan koneksi backend.'),
    });
  }

  deleteTelephone(person: Telephone): void {
    if (!window.confirm(`Hapus kontak ${person.Nama_User}?`)) return;
    this.http.delete(`${API_URL}/${person.id}`).subscribe({
      next: () => {
        if (this.selectedTelephone()?.id === person.id) this.selectedTelephone.set(null);
        this.notice.set('Kontak berhasil dihapus.');
        this.loadTelephones();
      },
      error: () => this.error.set('Kontak gagal dihapus. Periksa koneksi backend.'),
    });
  }

  openTodoForm(): void {
    this.todoDraft.set('');
    this.todoFormOpen.set(true);
  }

  createTodo(): void {
    const title = this.todoDraft().trim();
    if (!title) return;
    this.http.post<Todo>(TODOS_URL, { userId: 1, title, completed: false }).subscribe({
      next: (todo) => {
        this.todos.update((items) => [{ ...todo, id: Date.now() }, ...items]);
        this.todoFormOpen.set(false);
        this.notice.set('Todo dikirim ke JSONPlaceholder.');
      },
      error: () => this.error.set('Todo gagal dikirim ke JSONPlaceholder.'),
    });
  }

  toggleTodo(todo: Todo): void {
    this.http.patch<Todo>(`${TODOS_URL}/${todo.id}`, { completed: !todo.completed }).subscribe({
      next: () => this.todos.update((items) => items.map((item) =>
        item.id === todo.id ? { ...item, completed: !item.completed } : item,
      )),
      error: () => this.error.set('Status todo gagal diperbarui.'),
    });
  }

  deleteTodo(todo: Todo): void {
    this.http.delete(`${TODOS_URL}/${todo.id}`).subscribe({
      next: () => {
        this.todos.update((items) => items.filter((item) => item.id !== todo.id));
        this.notice.set('Todo dihapus dari tampilan demo.');
      },
      error: () => this.error.set('Todo gagal dihapus.'),
    });
  }

  completedCount(): number {
    return this.todos().filter((todo) => todo.completed).length;
  }

  private emptyDraft(): TelephoneInput {
    return { Nama_User: '', Alamat: '', No_Telp: '', kode_post: '' };
  }

  private setDraft(value: TelephoneInput): void {
    Object.assign(this.draft, value);
  }
}
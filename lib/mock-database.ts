// Mock in-memory database for development when Supabase is unavailable
// This allows the app to work without a real database connection

interface MockUser {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

class MockDatabase {
  private users: Map<string, MockUser> = new Map()
  private nextId = 1

  constructor() {
    // Add some demo users for testing
    this.seedDemoUsers()
  }

  private seedDemoUsers() {
    // Demo user for testing
    this.users.set('demo@example.com', {
      id: 'demo-user-1',
      email: 'demo@example.com',
      password: '$2a$12$NhQquwFhwUphL9GvUDxvIuIx5YODWIiIpJrC0gd0TCqSvqH6OZHBq', // hashed: "password123"
      firstName: 'Demo',
      lastName: 'User',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  findUserByEmail(email: string): MockUser | undefined {
    return this.users.get(email.toLowerCase())
  }

  createUser(data: Omit<MockUser, 'id' | 'createdAt' | 'updatedAt'>): MockUser {
    const existingUser = this.findUserByEmail(data.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const user: MockUser = {
      ...data,
      id: `user-${this.nextId++}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.users.set(data.email.toLowerCase(), user)
    return user
  }

  getAllUsers(): MockUser[] {
    return Array.from(this.users.values())
  }

  clear() {
    this.users.clear()
    this.seedDemoUsers()
  }
}

// Singleton instance
let dbInstance: MockDatabase | null = null

export function getMockDatabase(): MockDatabase {
  if (!dbInstance) {
    dbInstance = new MockDatabase()
  }
  return dbInstance
}

export function resetMockDatabase() {
  if (dbInstance) {
    dbInstance.clear()
  }
}

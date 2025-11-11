import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { User, UserRole } from './auth'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialize files if they don't exist
function initFile(filePath: string, defaultValue: any) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2))
  }
}

initFile(USERS_FILE, [])
initFile(PRODUCTS_FILE, [])
initFile(NOTIFICATIONS_FILE, [])

// Users
export async function getUsers(): Promise<User[]> {
  const data = fs.readFileSync(USERS_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers()
  return users.find(u => u.email === email) || null
}

export async function createUser(email: string, password: string, role: UserRole, name: string): Promise<User> {
  const users = await getUsers()
  
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists')
  }
  
  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser: User = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    role,
    name
  }
  
  users.push(newUser)
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  
  return newUser
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  if (!user) return null
  
  const isValid = await bcrypt.compare(password, user.password)
  return isValid ? user : null
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const users = await getUsers()
  const index = users.findIndex(u => u.id === id)
  
  if (index === -1) {
    throw new Error('User not found')
  }
  
  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  
  return users[index]
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers()
  return users.find(u => u.id === id) || null
}

// Products
export interface Product {
  id: string
  userId: string
  userName: string
  userEmail: string
  title: string
  description: string
  originalBudget: number
  adminModifiedBudget: number | null
  status: 'pending' | 'approved' | 'rejected' | 'accepted' | 'demo_submitted' | 'demo_approved' | 'demo_rejected' | 'payment_pending' | 'payment_completed'
  acceptedSellerId: string | null
  acceptedSellerName: string | null
  demoUrl: string | null
  demoDescription: string | null
  demoSubmittedAt: string | null
  demoApprovedBy: string | null
  demoRejectedBy: string | null
  demoRejectionReason: string | null
  paymentStatus: 'pending' | 'completed' | null
  paymentAmount: number | null
  paymentDate: string | null
  paymentTransactionId: string | null
  createdAt: string
  updatedAt: string
}

export async function getProducts(): Promise<Product[]> {
  const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts()
  return products.find(p => p.id === id) || null
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'adminModifiedBudget' | 'status' | 'acceptedSellerId' | 'acceptedSellerName' | 'demoUrl' | 'demoDescription' | 'demoSubmittedAt' | 'demoApprovedBy' | 'demoRejectedBy' | 'demoRejectionReason' | 'paymentStatus' | 'paymentAmount' | 'paymentDate' | 'paymentTransactionId'>): Promise<Product> {
  const products = await getProducts()
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    adminModifiedBudget: null,
    status: 'pending',
    acceptedSellerId: null,
    acceptedSellerName: null,
    demoUrl: null,
    demoDescription: null,
    demoSubmittedAt: null,
    demoApprovedBy: null,
    demoRejectedBy: null,
    demoRejectionReason: null,
    paymentStatus: null,
    paymentAmount: null,
    paymentDate: null,
    paymentTransactionId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  products.push(newProduct)
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))
  
  return newProduct
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const products = await getProducts()
  const index = products.findIndex(p => p.id === id)
  
  if (index === -1) {
    throw new Error('Product not found')
  }
  
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))
  
  return products[index]
}

// Notifications
export interface Notification {
  id: string
  sellerId: string
  productId: string
  message: string
  read: boolean
  type?: 'product_approved' | 'product_taken' | 'product_accepted'
  createdAt: string
}

export async function getNotifications(sellerId?: string): Promise<Notification[]> {
  const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8')
  const notifications = JSON.parse(data)
  
  if (sellerId) {
    return notifications.filter((n: Notification) => n.sellerId === sellerId)
  }
  
  return notifications
}

export async function createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> {
  const notifications = await getNotifications()
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    read: false,
    type: notification.type || 'product_approved',
    createdAt: new Date().toISOString()
  }
  
  notifications.push(newNotification)
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2))
  
  return newNotification
}

// User notifications
const USER_NOTIFICATIONS_FILE = path.join(DATA_DIR, 'user-notifications.json')
initFile(USER_NOTIFICATIONS_FILE, [])

export interface UserNotification {
  id: string
  userId: string
  productId: string
  message: string
  read: boolean
  createdAt: string
}

export async function getUserNotifications(userId: string): Promise<UserNotification[]> {
  const data = fs.readFileSync(USER_NOTIFICATIONS_FILE, 'utf-8')
  const notifications = JSON.parse(data)
  return notifications.filter((n: UserNotification) => n.userId === userId)
}

export async function createUserNotification(notification: Omit<UserNotification, 'id' | 'read' | 'createdAt'>): Promise<UserNotification> {
  const data = fs.readFileSync(USER_NOTIFICATIONS_FILE, 'utf-8')
  const notifications = JSON.parse(data)
  const newNotification: UserNotification = {
    ...notification,
    id: Date.now().toString(),
    read: false,
    createdAt: new Date().toISOString()
  }
  
  notifications.push(newNotification)
  fs.writeFileSync(USER_NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2))
  
  return newNotification
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const notifications = await getNotifications()
  const index = notifications.findIndex(n => n.id === id)
  
  if (index !== -1) {
    notifications[index].read = true
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2))
  }
}


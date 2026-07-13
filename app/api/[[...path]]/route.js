import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

let clientPromise
let db

async function connectToMongo() {
  if (db) return db
  if (!clientPromise) {
    const c = new MongoClient(process.env.MONGO_URL)
    clientPromise = c.connect().then(cli => { db = cli.db(process.env.DB_NAME); return cli })
  }
  await clientPromise
  return db
}

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }))
}

function slugify(str) {
  return String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw + 'cloud-district-salt').digest('hex')
}

async function requireAdmin(request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '').trim()
  if (!token) return null
  const database = await connectToMongo()
  const session = await database.collection('sessions').findOne({ token })
  if (!session) return null
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) return null
  return session
}

const SEED_VERSION = 'v5'
let seedInProgress = null

async function ensureSeed(database) {
  const existing = await database.collection('settings').findOne({ id: 'main' })
  if (existing && existing.seedVersion === SEED_VERSION) return
  if (seedInProgress) return seedInProgress
  seedInProgress = (async () => {
    try {
      await runSeed(database)
    } finally {
      seedInProgress = null
    }
  })()
  return seedInProgress
}

async function runSeed(database) {
  const existing = await database.collection('settings').findOne({ id: 'main' })
  if (existing && existing.seedVersion === SEED_VERSION) return

  // Reset data collections (keep sessions + admin_users)
  await database.collection('products').deleteMany({})
  await database.collection('categories').deleteMany({})
  await database.collection('banners').deleteMany({})

  // Settings
  await database.collection('settings').updateOne(
    { id: 'main' },
    {
      $set: {
        id: 'main',
        storeName: 'Cloud District',
        logoUrl: '',
        whatsappNumber: '525555555555',
        whatsappMessage: 'Hola, quisiera recibir información sobre sus productos.',
        instagram: 'https://instagram.com/clouddistrict',
        tiktok: 'https://tiktok.com/@clouddistrict',
        facebook: 'https://facebook.com/clouddistrict',
        address: 'Av. Reforma 123, CDMX, México',
        hours: 'Lun-Dom 11:00 - 22:00',
        email: 'contacto@clouddistrict.mx',
        footerText: 'Productos exclusivos para mayores de edad. Prohibida su venta a menores de 18 años.',
        currency: 'USD',
        currencySymbol: '$',
        legalNotice: 'El uso de productos de vapeo puede ser dañino para la salud.',
        minAge: 18,
        seedVersion: SEED_VERSION,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  )

  // Admin user (only if not present)
  const adminExists = await database.collection('admin_users').findOne({ email: 'admin@clouddistrict.com' })
  if (!adminExists) {
    await database.collection('admin_users').insertOne({
      id: uuidv4(),
      email: 'admin@clouddistrict.com',
      passwordHash: hashPassword('admin123'),
      role: 'owner',
      createdAt: new Date()
    })
  }

  // Categories: only Vape + Mieles
  const cats = [
    { name: 'Vape', description: 'Dispositivos, pods desechables y sistemas de vapeo de última generación.', image: 'https://images.unsplash.com/photo-1545095088-26a59e3f2717?w=800' },
    { name: 'Mieles', description: 'Mieles artesanales y variedades premium seleccionadas.', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800' }
  ]
  const catDocs = cats.map((c, i) => ({
    id: uuidv4(),
    name: c.name,
    slug: slugify(c.name),
    description: c.description,
    image: c.image,
    active: true,
    order: i,
    createdAt: new Date()
  }))
  await database.collection('categories').insertMany(catDocs)

  const vapeCat = catDocs.find(c => c.name === 'Vape')
  const mielCat = catDocs.find(c => c.name === 'Mieles')
  const vapeImgs = [
    'https://images.unsplash.com/photo-1545095088-26a59e3f2717?w=1200',
    'https://images.unsplash.com/photo-1536405416754-3bcd4fb38128?w=1200',
    'https://images.pexels.com/photos/3545426/pexels-photo-3545426.jpeg?w=1200'
  ]
  const mielImgs = [
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200',
    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200'
  ]

  const productSeeds = [
    { name: 'Nebula Pro X 40K', cat: 'Vape', price: 52, oldPrice: null, tag: 'Nuevo', featured: true, sliderOrder: 0, stock: 15, puffs: 40000, desc: 'Vape desechable premium con 40,000 puffs, pantalla LED, doble malla y batería recargable USB-C.' },
    { name: 'Aurora 5K', cat: 'Vape', price: 18, oldPrice: 22, tag: 'Más vendido', featured: true, sliderOrder: 1, stock: 30, puffs: 5000, desc: 'Compacto y portátil con 5,000 puffs, sabor consistente y sistema mesh.' },
    { name: 'Blue Ice 8K', cat: 'Vape', price: 15, oldPrice: null, tag: 'Oferta', featured: true, sliderOrder: 2, stock: 50, puffs: 8000, desc: 'Sabor arándano-menta helado, 8,000 puffs, recargable.' },
    { name: 'Titan XL 25K', cat: 'Vape', price: 42, oldPrice: 48, tag: 'Nuevo', featured: true, sliderOrder: 3, stock: 8, puffs: 25000, desc: 'Formato XL con 25,000 puffs, pantalla digital y modo turbo/eco.' },
    { name: 'Purple Haze 15K', cat: 'Vape', price: 28, oldPrice: null, tag: null, featured: true, sliderOrder: 4, stock: 40, puffs: 15000, desc: 'Blend de uva y mora silvestre. 15,000 puffs, nubes densas y sabor prolongado.' },
    { name: 'Mango Freeze 10K', cat: 'Vape', price: 22, oldPrice: null, tag: 'Más vendido', featured: false, sliderOrder: null, stock: 60, puffs: 10000, desc: 'Mango tropical helado, 10,000 puffs, diseño slim.' },
    { name: 'Stealth Mini 3K', cat: 'Vape', price: 12, oldPrice: null, tag: null, featured: false, sliderOrder: null, stock: 25, puffs: 3000, desc: 'Ultra portátil, 3,000 puffs, ideal para uso ocasional.' },
    { name: 'Cool Mint XL 20K', cat: 'Vape', price: 35, oldPrice: 40, tag: 'Oferta', featured: false, sliderOrder: null, stock: 20, puffs: 20000, desc: 'Menta fresca cristalina, 20,000 puffs, battería de larga duración.' },
    { name: 'Miel Silvestre 250g', cat: 'Mieles', price: 12, oldPrice: null, tag: null, featured: false, sliderOrder: null, stock: 40, puffs: null, desc: 'Miel silvestre 100% pura, cosechada en zonas montañosas. Frasco de 250g.' },
    { name: 'Miel con Propóleo 200g', cat: 'Mieles', price: 16, oldPrice: 20, tag: 'Nuevo', featured: false, sliderOrder: null, stock: 30, puffs: null, desc: 'Miel enriquecida con propóleo, ideal para el sistema inmune. 200g.' }
  ]

  const now = new Date()
  const products = productSeeds.map((p, i) => {
    const cat = p.cat === 'Vape' ? vapeCat : mielCat
    const gallery = p.cat === 'Vape' ? vapeImgs : mielImgs
    return {
      id: uuidv4(),
      name: p.name,
      slug: slugify(p.name),
      shortDescription: p.desc.slice(0, 90) + (p.desc.length > 90 ? '...' : ''),
      description: p.desc + ' Producto exclusivo para mayores de edad. Consulta stock y disponibilidad por WhatsApp.',
      price: p.price,
      oldPrice: p.oldPrice,
      categoryId: cat?.id,
      categoryName: cat?.name,
      stock: p.stock,
      stockStatus: p.stock === 0 ? 'agotado' : p.stock < 10 ? 'ultimas-unidades' : 'disponible',
      active: true,
      featured: p.featured,
      tag: p.tag,
      order: i,
      sliderOrder: p.sliderOrder,
      inSlider: p.sliderOrder !== null && p.sliderOrder !== undefined,
      puffs: p.puffs,
      features: p.cat === 'Vape'
        ? ['Producto original', p.puffs ? `${p.puffs.toLocaleString()} puffs` : 'Alta duración', 'Garantía del fabricante', 'Envío discreto']
        : ['Producto artesanal', '100% natural', 'Envasado de origen', 'Garantía de frescura'],
      images: gallery,
      views: Math.floor(Math.random() * 100),
      createdAt: now,
      updatedAt: now
    }
  })
  await database.collection('products').insertMany(products)

  await database.collection('banners').insertOne({
    id: uuidv4(),
    title: 'Nueva colección 40K',
    text: 'Descubre nuestra línea de vapeo desechable con hasta 40,000 puffs, diseño minimalista y máxima duración.',
    image: vapeImgs[1],
    buttonText: 'Ver colección',
    link: '#productos',
    gradient: 'from-zinc-700 via-zinc-800 to-zinc-950',
    active: true,
    createdAt: new Date()
  })
}

async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = '/' + path.join('/')
  const method = request.method

  try {
    const database = await connectToMongo()
    await ensureSeed(database)

    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      const user = await database.collection('admin_users').findOne({ email: body.email })
      if (!user || user.passwordHash !== hashPassword(body.password || '')) {
        return cors(NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 }))
      }
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await database.collection('sessions').insertOne({ token, userId: user.id, email: user.email, expiresAt, createdAt: new Date() })
      return cors(NextResponse.json({ token, email: user.email, role: user.role }))
    }

    if (route === '/auth/me' && method === 'GET') {
      const session = await requireAdmin(request)
      if (!session) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      return cors(NextResponse.json({ email: session.email }))
    }

    if (route === '/auth/logout' && method === 'POST') {
      const auth = request.headers.get('authorization') || ''
      const token = auth.replace('Bearer ', '').trim()
      if (token) await database.collection('sessions').deleteOne({ token })
      return cors(NextResponse.json({ ok: true }))
    }

    if (route === '/settings' && method === 'GET') {
      const s = await database.collection('settings').findOne({ id: 'main' })
      if (s) delete s._id
      return cors(NextResponse.json(s))
    }
    if (route === '/settings' && method === 'PUT') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const body = await request.json()
      body.updatedAt = new Date()
      delete body._id
      await database.collection('settings').updateOne({ id: 'main' }, { $set: body }, { upsert: true })
      const s = await database.collection('settings').findOne({ id: 'main' })
      if (s) delete s._id
      return cors(NextResponse.json(s))
    }

    if (route === '/categories' && method === 'GET') {
      const items = await database.collection('categories').find({}).sort({ order: 1 }).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/categories' && method === 'POST') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const body = await request.json()
      const doc = { id: uuidv4(), name: body.name, slug: slugify(body.name), description: body.description || '', image: body.image || '', active: body.active !== false, order: body.order || 0, createdAt: new Date() }
      await database.collection('categories').insertOne(doc)
      delete doc._id
      return cors(NextResponse.json(doc))
    }
    if (route.startsWith('/categories/') && method === 'PUT') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const id = route.split('/')[2]
      const body = await request.json()
      delete body._id
      if (body.name) body.slug = slugify(body.name)
      await database.collection('categories').updateOne({ id }, { $set: body })
      const item = await database.collection('categories').findOne({ id })
      if (item) delete item._id
      return cors(NextResponse.json(item))
    }
    if (route.startsWith('/categories/') && method === 'DELETE') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const id = route.split('/')[2]
      await database.collection('categories').deleteOne({ id })
      return cors(NextResponse.json({ ok: true }))
    }

    if (route === '/products' && method === 'GET') {
      const url = new URL(request.url)
      const filter = {}
      const publicOnly = url.searchParams.get('all') !== '1'
      if (publicOnly) filter.active = true
      const category = url.searchParams.get('category')
      if (category) filter.categoryId = category
      const featured = url.searchParams.get('featured')
      if (featured === '1') filter.featured = true
      const inSlider = url.searchParams.get('slider')
      if (inSlider === '1') filter.inSlider = true
      const search = url.searchParams.get('search')
      if (search) filter.name = { $regex: search, $options: 'i' }
      let cursor = database.collection('products').find(filter)
      const sort = url.searchParams.get('sort')
      if (sort === 'price-asc') cursor = cursor.sort({ price: 1 })
      else if (sort === 'price-desc') cursor = cursor.sort({ price: -1 })
      else if (sort === 'newest') cursor = cursor.sort({ createdAt: -1 })
      else if (sort === 'featured') cursor = cursor.sort({ featured: -1, order: 1 })
      else if (inSlider === '1') cursor = cursor.sort({ sliderOrder: 1 })
      else cursor = cursor.sort({ order: 1 })
      const items = await cursor.toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }

    if (route.startsWith('/products/slug/') && method === 'GET') {
      const slug = route.split('/')[3]
      const p = await database.collection('products').findOne({ slug })
      if (!p) return cors(NextResponse.json({ error: 'not found' }, { status: 404 }))
      await database.collection('products').updateOne({ id: p.id }, { $inc: { views: 1 } })
      delete p._id
      return cors(NextResponse.json(p))
    }

    if (route === '/products' && method === 'POST') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const body = await request.json()
      const cat = body.categoryId ? await database.collection('categories').findOne({ id: body.categoryId }) : null
      const now = new Date()
      const doc = {
        id: uuidv4(),
        name: body.name,
        slug: slugify(body.slug || body.name),
        shortDescription: body.shortDescription || '',
        description: body.description || '',
        price: Number(body.price) || 0,
        oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
        categoryId: body.categoryId || null,
        categoryName: cat?.name || '',
        stock: Number(body.stock) || 0,
        stockStatus: Number(body.stock) === 0 ? 'agotado' : Number(body.stock) < 10 ? 'ultimas-unidades' : 'disponible',
        active: body.active !== false,
        featured: !!body.featured,
        tag: body.tag || null,
        order: body.order || 0,
        sliderOrder: body.sliderOrder ?? null,
        inSlider: !!body.inSlider,
        puffs: body.puffs ? Number(body.puffs) : null,
        features: body.features || [],
        images: body.images || [],
        views: 0,
        createdAt: now,
        updatedAt: now
      }
      await database.collection('products').insertOne(doc)
      delete doc._id
      return cors(NextResponse.json(doc))
    }

    if (route.startsWith('/products/') && method === 'PUT') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const id = route.split('/')[2]
      const body = await request.json()
      delete body._id
      delete body.id
      if (body.name) body.slug = slugify(body.slug || body.name)
      if (body.categoryId) {
        const cat = await database.collection('categories').findOne({ id: body.categoryId })
        body.categoryName = cat?.name || ''
      }
      if (body.stock !== undefined) {
        body.stock = Number(body.stock)
        body.stockStatus = body.stock === 0 ? 'agotado' : body.stock < 10 ? 'ultimas-unidades' : 'disponible'
      }
      if (body.price !== undefined) body.price = Number(body.price)
      if (body.oldPrice !== undefined && body.oldPrice !== null && body.oldPrice !== '') body.oldPrice = Number(body.oldPrice)
      if (body.puffs !== undefined && body.puffs !== null && body.puffs !== '') body.puffs = Number(body.puffs)
      body.updatedAt = new Date()
      await database.collection('products').updateOne({ id }, { $set: body })
      const item = await database.collection('products').findOne({ id })
      if (item) delete item._id
      return cors(NextResponse.json(item))
    }

    if (route.startsWith('/products/') && route.endsWith('/duplicate') && method === 'POST') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const id = route.split('/')[2]
      const item = await database.collection('products').findOne({ id })
      if (!item) return cors(NextResponse.json({ error: 'not found' }, { status: 404 }))
      const now = new Date()
      const copy = { ...item, id: uuidv4(), name: item.name + ' (copia)', slug: slugify(item.name + '-copia-' + Date.now()), createdAt: now, updatedAt: now, views: 0 }
      delete copy._id
      await database.collection('products').insertOne(copy)
      return cors(NextResponse.json(copy))
    }

    if (route.startsWith('/products/') && method === 'DELETE') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const id = route.split('/')[2]
      await database.collection('products').deleteOne({ id })
      return cors(NextResponse.json({ ok: true }))
    }

    if (route === '/slider' && method === 'PUT') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const body = await request.json()
      if (body.removedIds && Array.isArray(body.removedIds)) {
        for (const id of body.removedIds) {
          await database.collection('products').updateOne({ id }, { $set: { inSlider: false, sliderOrder: null } })
        }
      }
      if (body.items && Array.isArray(body.items)) {
        for (const it of body.items) {
          await database.collection('products').updateOne({ id: it.id }, { $set: { inSlider: true, sliderOrder: it.order } })
        }
      }
      return cors(NextResponse.json({ ok: true }))
    }

    if (route === '/banners' && method === 'GET') {
      const items = await database.collection('banners').find({}).sort({ createdAt: -1 }).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/banners' && method === 'POST') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const body = await request.json()
      const doc = { id: uuidv4(), title: body.title || '', text: body.text || '', image: body.image || '', buttonText: body.buttonText || 'Ver más', link: body.link || '#', gradient: body.gradient || 'from-zinc-800 via-zinc-900 to-black', active: body.active !== false, createdAt: new Date() }
      await database.collection('banners').insertOne(doc)
      delete doc._id
      return cors(NextResponse.json(doc))
    }
    if (route.startsWith('/banners/') && method === 'PUT') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const id = route.split('/')[2]
      const body = await request.json()
      delete body._id
      await database.collection('banners').updateOne({ id }, { $set: body })
      const item = await database.collection('banners').findOne({ id })
      if (item) delete item._id
      return cors(NextResponse.json(item))
    }
    if (route.startsWith('/banners/') && method === 'DELETE') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const id = route.split('/')[2]
      await database.collection('banners').deleteOne({ id })
      return cors(NextResponse.json({ ok: true }))
    }

    if (route === '/whatsapp-click' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      await database.collection('whatsapp_clicks').insertOne({ id: uuidv4(), productId: body.productId || null, productName: body.productName || null, source: body.source || 'unknown', device: body.device || 'unknown', createdAt: new Date() })
      if (body.productId) await database.collection('products').updateOne({ id: body.productId }, { $inc: { views: 1 } })
      return cors(NextResponse.json({ ok: true }))
    }

    if (route === '/stats' && method === 'GET') {
      if (!(await requireAdmin(request))) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const [totalProducts, activeProducts, outOfStock, featured, totalCategories, totalClicks] = await Promise.all([
        database.collection('products').countDocuments({}),
        database.collection('products').countDocuments({ active: true }),
        database.collection('products').countDocuments({ stock: 0 }),
        database.collection('products').countDocuments({ featured: true }),
        database.collection('categories').countDocuments({}),
        database.collection('whatsapp_clicks').countDocuments({})
      ])
      const topProducts = await database.collection('products').find({}).sort({ views: -1 }).limit(5).toArray()
      const clicksByDay = await database.collection('whatsapp_clicks').aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 14 }
      ]).toArray()
      const productsByCategory = await database.collection('products').aggregate([
        { $group: { _id: '$categoryName', count: { $sum: 1 } } }
      ]).toArray()
      const clicksByProduct = await database.collection('whatsapp_clicks').aggregate([
        { $match: { productName: { $ne: null } } },
        { $group: { _id: '$productName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]).toArray()
      return cors(NextResponse.json({
        totalProducts, activeProducts, outOfStock, featured, totalCategories, totalClicks,
        topProducts: topProducts.map(({ _id, ...r }) => r),
        clicksByDay: clicksByDay.map(x => ({ date: x._id, count: x.count })),
        productsByCategory: productsByCategory.map(x => ({ name: x._id || 'Sin categoría', count: x.count })),
        clicksByProduct: clicksByProduct.map(x => ({ name: x._id, count: x.count }))
      }))
    }

    if (route === '/root' && method === 'GET') return cors(NextResponse.json({ message: 'Cloud District API' }))
    return cors(NextResponse.json({ error: 'Route ' + route + ' not found' }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return cors(NextResponse.json({ error: 'Internal server error', detail: String(error.message) }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute

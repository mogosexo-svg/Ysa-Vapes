'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { LayoutDashboard, Package, Grid3x3, Sliders, Image as ImageIcon, Settings, LogOut, Plus, Search, Pencil, Trash2, Copy, Upload, X, Sparkles, TrendingUp, MessageCircle, Eye, Star, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react'
import { apiFetch, getToken, setToken } from '@/lib/api'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'

const COLORS = ['#a855f7', '#6366f1', '#06b6d4', '#8b5cf6', '#3b82f6']

function LoginView({ onLogin }) {
  const [email, setEmail] = useState('admin@clouddistrict.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setToken(data.token)
      toast.success('Bienvenido')
      onLogin()
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen radial-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="glass-strong border-purple-500/20 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mb-4 neon-glow">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Cloud District Admin</h1>
            <p className="text-white/60 text-sm mt-1">Ingresa a tu panel</p>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} className="glass border-white/10 h-11" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Contraseña</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="glass border-white/10 h-11" />
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full h-11 btn-primary-tesla font-semibold">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
            <p className="text-xs text-white/40 text-center">Default: admin@clouddistrict.com / admin123</p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

function DashboardView() {
  const [stats, setStats] = useState(null)
  useEffect(() => { apiFetch('/stats').then(setStats).catch(() => {}) }, [])
  if (!stats) return <div className="p-8 text-white/60">Cargando...</div>

  const cards = [
    { label: 'Productos totales', value: stats.totalProducts, icon: Package, color: 'from-purple-500 to-indigo-500' },
    { label: 'Productos activos', value: stats.activeProducts, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
    { label: 'Agotados', value: stats.outOfStock, icon: X, color: 'from-red-500 to-orange-500' },
    { label: 'Destacados', value: stats.featured, icon: Star, color: 'from-amber-500 to-yellow-500' },
    { label: 'Categorías', value: stats.totalCategories, icon: Grid3x3, color: 'from-blue-500 to-cyan-500' },
    { label: 'Clics WhatsApp', value: stats.totalClicks, icon: MessageCircle, color: 'from-emerald-600 to-green-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black mb-1">Dashboard</h1>
        <p className="text-white/60">Resumen de tu tienda Cloud District</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                  <c.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-black">{c.value}</div>
              <div className="text-xs text-white/60 mt-1">{c.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="glass border-white/10 p-6">
          <h3 className="font-bold mb-4">Clics WhatsApp por día</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.clicksByDay}>
                <XAxis dataKey="date" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="glass border-white/10 p-6">
          <h3 className="font-bold mb-4">Productos por categoría</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.productsByCategory} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => e.name}>
                  {stats.productsByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="glass border-white/10 p-6 lg:col-span-2">
          <h3 className="font-bold mb-4">Consultas por producto</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.clicksByProduct}>
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                <Bar dataKey="count" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="glass border-white/10 p-6">
        <h3 className="font-bold mb-4">Productos más vistos</h3>
        <div className="space-y-2">
          {stats.topProducts.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5">
              <img src={p.images?.[0]} className="h-12 w-12 rounded-lg object-cover" alt="" />
              <div className="flex-1">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-xs text-white/60">{p.categoryName} · ${p.price}</div>
              </div>
              <div className="text-sm text-white/70 flex items-center gap-1"><Eye className="h-3 w-3" /> {p.views}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function fileToDataUrl(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file) })
}

function ProductFormDialog({ open, onClose, product, categories, onSaved }) {
  const [form, setForm] = useState({})
  useEffect(() => {
    setForm(product || { name: '', shortDescription: '', description: '', price: 0, oldPrice: null, categoryId: '', stock: 0, active: true, featured: false, tag: '', features: [], images: [], inSlider: false, puffs: null })
  }, [product, open])

  const save = async () => {
    try {
      if (!form.name || !form.price) return toast.error('Nombre y precio son requeridos')
      if (product?.id) await apiFetch('/products/' + product.id, { method: 'PUT', body: JSON.stringify(form) })
      else await apiFetch('/products', { method: 'POST', body: JSON.stringify(form) })
      toast.success('Producto guardado')
      onSaved(); onClose()
    } catch (e) { toast.error(e.message) }
  }

  const addImage = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const dataUrls = await Promise.all(files.map(fileToDataUrl))
    setForm(f => ({ ...f, images: [...(f.images || []), ...dataUrls].slice(0, 5) }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-strong border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{product?.id ? 'Editar producto' : 'Nuevo producto'}</DialogTitle></DialogHeader>
        <div className="grid md:grid-cols-2 gap-4 py-4">
          <div className="md:col-span-2">
            <Label>Nombre</Label>
            <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="glass border-white/10 mt-1" />
          </div>
          <div>
            <Label>Precio</Label>
            <Input type="number" value={form.price || 0} onChange={e => setForm({ ...form, price: e.target.value })} className="glass border-white/10 mt-1" />
          </div>
          <div>
            <Label>Precio anterior (opcional)</Label>
            <Input type="number" value={form.oldPrice || ''} onChange={e => setForm({ ...form, oldPrice: e.target.value || null })} className="glass border-white/10 mt-1" />
          </div>
          <div>
            <Label>Stock</Label>
            <Input type="number" value={form.stock || 0} onChange={e => setForm({ ...form, stock: e.target.value })} className="glass border-white/10 mt-1" />
          </div>
          <div>
            <Label>Puffs (opcional)</Label>
            <Input type="number" value={form.puffs || ''} onChange={e => setForm({ ...form, puffs: e.target.value || null })} placeholder="Ej: 40000" className="glass border-white/10 mt-1" />
          </div>
          <div>
            <Label>Categoría</Label>
            <Select value={form.categoryId || ''} onValueChange={v => setForm({ ...form, categoryId: v })}>
              <SelectTrigger className="glass border-white/10 mt-1"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent className="glass-strong border-white/10">
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Etiqueta</Label>
            <Select value={form.tag || 'none'} onValueChange={v => setForm({ ...form, tag: v === 'none' ? null : v })}>
              <SelectTrigger className="glass border-white/10 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="glass-strong border-white/10">
                <SelectItem value="none">Sin etiqueta</SelectItem>
                <SelectItem value="Nuevo">Nuevo</SelectItem>
                <SelectItem value="Oferta">Oferta</SelectItem>
                <SelectItem value="Más vendido">Más vendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><Switch checked={form.active !== false} onCheckedChange={v => setForm({ ...form, active: v })} /><Label>Activo</Label></div>
            <div className="flex items-center gap-2"><Switch checked={!!form.featured} onCheckedChange={v => setForm({ ...form, featured: v })} /><Label>Destacado</Label></div>
          </div>
          <div className="md:col-span-2">
            <Label>Descripción corta</Label>
            <Input value={form.shortDescription || ''} onChange={e => setForm({ ...form, shortDescription: e.target.value })} className="glass border-white/10 mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label>Descripción completa</Label>
            <Textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="glass border-white/10 mt-1 min-h-24" />
          </div>
          <div className="md:col-span-2">
            <Label>Características (una por línea)</Label>
            <Textarea value={(form.features || []).join('\n')} onChange={e => setForm({ ...form, features: e.target.value.split('\n').filter(Boolean) })} className="glass border-white/10 mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label>Imágenes (hasta 5)</Label>
            <div className="mt-2 flex gap-2 flex-wrap">
              {(form.images || []).map((img, i) => (
                <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden group">
                  <img src={img} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                </div>
              ))}
              {(form.images || []).length < 5 && (
                <label className="h-20 w-20 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/5">
                  <Upload className="h-5 w-5 text-white/50" />
                  <input type="file" accept="image/*" multiple onChange={addImage} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} className="btn-primary-tesla font-semibold">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProductsView() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const load = async () => {
    const [p, c] = await Promise.all([apiFetch('/products?all=1'), apiFetch('/categories')])
    setProducts(p); setCategories(c)
  }
  useEffect(() => { load() }, [])

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  const doDelete = async () => {
    try { await apiFetch('/products/' + toDelete.id, { method: 'DELETE' }); toast.success('Eliminado'); setToDelete(null); load() }
    catch (e) { toast.error(e.message) }
  }

  const duplicate = async (p) => {
    try { await apiFetch('/products/' + p.id + '/duplicate', { method: 'POST' }); toast.success('Duplicado'); load() }
    catch (e) { toast.error(e.message) }
  }

  const quickToggle = async (p, field) => {
    await apiFetch('/products/' + p.id, { method: 'PUT', body: JSON.stringify({ [field]: !p[field] }) })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-3xl font-black">Productos</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9 glass border-white/10 w-64" />
          </div>
          <Button onClick={() => { setEditing(null); setOpen(true) }} className="btn-primary-tesla font-semibold"><Plus className="h-4 w-4 mr-2" /> Nuevo</Button>
        </div>
      </div>

      <Card className="glass border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3">Producto</th>
                <th className="text-left p-3">Categoría</th>
                <th className="text-left p-3">Precio</th>
                <th className="text-left p-3">Stock</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Destacado</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} className="h-10 w-10 rounded-lg object-cover" alt="" />
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-white/50">{p.tag || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-white/70">{p.categoryName}</td>
                  <td className="p-3 font-semibold">${p.price} {p.oldPrice && <span className="text-xs text-white/40 line-through ml-1">${p.oldPrice}</span>}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3"><Switch checked={p.active} onCheckedChange={() => quickToggle(p, 'active')} /></td>
                  <td className="p-3"><Switch checked={p.featured} onCheckedChange={() => quickToggle(p, 'featured')} /></td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => duplicate(p)}><Copy className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setToDelete(p)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ProductFormDialog open={open} onClose={() => setOpen(false)} product={editing} categories={categories} onSaved={load} />

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent className="glass-strong border-white/10">
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={doDelete} className="bg-red-500 hover:bg-red-600">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CategoriesView() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const load = () => apiFetch('/categories').then(setItems)
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      if (!editing.name) return toast.error('Nombre requerido')
      if (editing.id) await apiFetch('/categories/' + editing.id, { method: 'PUT', body: JSON.stringify(editing) })
      else await apiFetch('/categories', { method: 'POST', body: JSON.stringify(editing) })
      toast.success('Guardado'); setOpen(false); load()
    } catch (e) { toast.error(e.message) }
  }

  const addImage = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    const dataUrl = await fileToDataUrl(f); setEditing({ ...editing, image: dataUrl })
  }

  const doDelete = async () => { await apiFetch('/categories/' + toDelete.id, { method: 'DELETE' }); toast.success('Eliminado'); setToDelete(null); load() }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">Categorías</h1>
        <Button onClick={() => { setEditing({ name: '', description: '', image: '', active: true, order: items.length }); setOpen(true) }} className="btn-primary-tesla font-semibold"><Plus className="h-4 w-4 mr-2" /> Nueva</Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(c => (
          <Card key={c.id} className="glass border-white/10 overflow-hidden">
            <div className="aspect-video overflow-hidden"><img src={c.image} alt={c.name} className="w-full h-full object-cover" /></div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold">{c.name}</div>
                  <div className="text-xs text-white/50">{c.slug}</div>
                </div>
                <Switch checked={c.active} onCheckedChange={async () => { await apiFetch('/categories/' + c.id, { method: 'PUT', body: JSON.stringify({ active: !c.active }) }); load() }} />
              </div>
              <p className="text-sm text-white/60 line-clamp-2 mb-3">{c.description}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 border-white/10" onClick={() => { setEditing(c); setOpen(true) }}><Pencil className="h-3.5 w-3.5 mr-1" /> Editar</Button>
                <Button size="icon" variant="ghost" onClick={() => setToDelete(c)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong border-white/10 max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-4">
              <div><Label>Nombre</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="glass border-white/10 mt-1" /></div>
              <div><Label>Descripción</Label><Textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="glass border-white/10 mt-1" /></div>
              <div><Label>Orden</Label><Input type="number" value={editing.order || 0} onChange={e => setEditing({ ...editing, order: Number(e.target.value) })} className="glass border-white/10 mt-1" /></div>
              <div>
                <Label>Imagen</Label>
                <div className="flex items-center gap-3 mt-1">
                  {editing.image && <img src={editing.image} className="h-16 w-16 rounded-lg object-cover" alt="" />}
                  <label className="cursor-pointer glass border-white/10 rounded-lg px-4 py-2 text-sm hover:bg-white/5"><Upload className="h-4 w-4 inline mr-2" />Subir<input type="file" accept="image/*" onChange={addImage} className="hidden" /></label>
                </div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editing.active !== false} onCheckedChange={v => setEditing({ ...editing, active: v })} /><Label>Activa</Label></div>
            </div>
          )}
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save} className="btn-primary-tesla font-semibold">Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent className="glass-strong border-white/10">
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={doDelete} className="bg-red-500 hover:bg-red-600">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SliderView() {
  const [inSlider, setInSlider] = useState([])
  const [available, setAvailable] = useState([])

  const load = async () => {
    const all = await apiFetch('/products?all=1')
    setInSlider(all.filter(p => p.inSlider).sort((a, b) => (a.sliderOrder || 0) - (b.sliderOrder || 0)))
    setAvailable(all.filter(p => !p.inSlider))
  }
  useEffect(() => { load() }, [])

  const move = (idx, dir) => {
    const arr = [...inSlider]
    const target = idx + dir
    if (target < 0 || target >= arr.length) return
    ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
    setInSlider(arr)
  }

  const addToSlider = (p) => {
    setInSlider([...inSlider, p])
    setAvailable(available.filter(x => x.id !== p.id))
  }

  const removeFromSlider = (p) => {
    setInSlider(inSlider.filter(x => x.id !== p.id))
    setAvailable([...available, p])
  }

  const save = async () => {
    const items = inSlider.map((p, i) => ({ id: p.id, order: i }))
    const removedIds = available.filter(p => p.inSlider).map(p => p.id)
    // Compute removed: any that were originally inSlider but now in available
    const allIds = [...inSlider, ...available]
    const originallyInSlider = allIds.filter(p => p.inSlider).map(p => p.id)
    const stillInSlider = inSlider.map(p => p.id)
    const removed = originallyInSlider.filter(id => !stillInSlider.includes(id))
    await apiFetch('/slider', { method: 'PUT', body: JSON.stringify({ items, removedIds: removed }) })
    toast.success('Slider guardado')
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">Slider destacados</h1>
        <Button onClick={save} className="btn-primary-tesla font-semibold">Guardar cambios</Button>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass border-white/10 p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Sliders className="h-4 w-4" /> En el slider ({inSlider.length})</h3>
          <div className="space-y-2">
            {inSlider.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg glass border-white/5">
                <span className="text-xs text-white/50 w-6">{i + 1}</span>
                <img src={p.images?.[0]} className="h-10 w-10 rounded object-cover" alt="" />
                <div className="flex-1 text-sm font-medium">{p.name}</div>
                <Button size="icon" variant="ghost" onClick={() => move(i, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => move(i, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => removeFromSlider(p)}><X className="h-4 w-4 text-red-400" /></Button>
              </div>
            ))}
            {inSlider.length === 0 && <div className="text-sm text-white/50 py-8 text-center">Vacío</div>}
          </div>
        </Card>
        <Card className="glass border-white/10 p-4">
          <h3 className="font-bold mb-3">Disponibles ({available.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {available.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                <img src={p.images?.[0]} className="h-10 w-10 rounded object-cover" alt="" />
                <div className="flex-1 text-sm">{p.name}</div>
                <Button size="sm" variant="outline" onClick={() => addToSlider(p)} className="border-white/10"><Plus className="h-3.5 w-3.5 mr-1" /> Agregar</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function BannersView() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)

  const load = () => apiFetch('/banners').then(setItems)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (editing.id) await apiFetch('/banners/' + editing.id, { method: 'PUT', body: JSON.stringify(editing) })
    else await apiFetch('/banners', { method: 'POST', body: JSON.stringify(editing) })
    toast.success('Guardado'); setOpen(false); load()
  }

  const addImage = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    setEditing({ ...editing, image: await fileToDataUrl(f) })
  }

  const gradients = [
    'from-purple-600 via-indigo-600 to-cyan-500',
    'from-pink-500 via-purple-500 to-indigo-600',
    'from-blue-600 via-cyan-500 to-emerald-500',
    'from-orange-500 via-red-500 to-purple-600',
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">Banners promocionales</h1>
        <Button onClick={() => { setEditing({ title: '', text: '', image: '', buttonText: 'Ver más', link: '#', gradient: gradients[0], active: true }); setOpen(true) }} className="btn-primary-tesla font-semibold"><Plus className="h-4 w-4 mr-2" /> Nuevo</Button>
      </div>
      <div className="space-y-4">
        {items.map(b => (
          <Card key={b.id} className={`overflow-hidden bg-gradient-to-r ${b.gradient} p-6`}>
            <div className="flex items-center gap-4">
              {b.image && <img src={b.image} className="h-20 w-20 rounded-lg object-cover" alt="" />}
              <div className="flex-1 text-white">
                <div className="font-bold text-lg">{b.title}</div>
                <div className="text-sm text-white/80 line-clamp-2">{b.text}</div>
                <Badge className="mt-2 bg-white/20 border-0">{b.active ? 'Activo' : 'Inactivo'}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="secondary" onClick={() => { setEditing(b); setOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="secondary" onClick={async () => { await apiFetch('/banners/' + b.id, { method: 'DELETE' }); load() }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong border-white/10 max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? 'Editar banner' : 'Nuevo banner'}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-4">
              <div><Label>Título</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="glass border-white/10 mt-1" /></div>
              <div><Label>Texto</Label><Textarea value={editing.text} onChange={e => setEditing({ ...editing, text: e.target.value })} className="glass border-white/10 mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Texto del botón</Label><Input value={editing.buttonText} onChange={e => setEditing({ ...editing, buttonText: e.target.value })} className="glass border-white/10 mt-1" /></div>
                <div><Label>Enlace</Label><Input value={editing.link} onChange={e => setEditing({ ...editing, link: e.target.value })} className="glass border-white/10 mt-1" /></div>
              </div>
              <div>
                <Label>Degradado</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {gradients.map(g => (
                    <button key={g} onClick={() => setEditing({ ...editing, gradient: g })} className={`h-10 rounded-lg bg-gradient-to-r ${g} ${editing.gradient === g ? 'ring-2 ring-white' : ''}`} />
                  ))}
                </div>
              </div>
              <div>
                <Label>Imagen</Label>
                <div className="flex items-center gap-3 mt-1">
                  {editing.image && <img src={editing.image} className="h-16 w-16 rounded-lg object-cover" alt="" />}
                  <label className="cursor-pointer glass border-white/10 rounded-lg px-4 py-2 text-sm hover:bg-white/5"><Upload className="h-4 w-4 inline mr-2" />Subir<input type="file" accept="image/*" onChange={addImage} className="hidden" /></label>
                </div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editing.active !== false} onCheckedChange={v => setEditing({ ...editing, active: v })} /><Label>Activo</Label></div>
            </div>
          )}
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save} className="btn-primary-tesla font-semibold">Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SettingsView() {
  const [s, setS] = useState(null)
  useEffect(() => { apiFetch('/settings').then(setS) }, [])
  const save = async () => {
    try { const updated = await apiFetch('/settings', { method: 'PUT', body: JSON.stringify(s) }); setS(updated); toast.success('Configuración guardada') }
    catch (e) { toast.error(e.message) }
  }
  const uploadLogo = async (e) => { const f = e.target.files?.[0]; if (!f) return; setS({ ...s, logoUrl: await fileToDataUrl(f) }) }
  if (!s) return <div className="p-8">Cargando...</div>
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">Configuración</h1>
        <Button onClick={save} className="btn-primary-tesla font-semibold">Guardar</Button>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="glass border-white/10 p-6 space-y-4">
          <h3 className="font-bold">Información general</h3>
          <div><Label>Nombre de la tienda</Label><Input value={s.storeName || ''} onChange={e => setS({ ...s, storeName: e.target.value })} className="glass border-white/10 mt-1" /></div>
          <div>
            <Label>Logo</Label>
            <div className="flex items-center gap-3 mt-1">
              {s.logoUrl && <img src={s.logoUrl} className="h-14 w-14 rounded-lg object-cover" alt="" />}
              <label className="cursor-pointer glass border-white/10 rounded-lg px-4 py-2 text-sm hover:bg-white/5"><Upload className="h-4 w-4 inline mr-2" />Subir<input type="file" accept="image/*" onChange={uploadLogo} className="hidden" /></label>
            </div>
          </div>
          <div><Label>Moneda</Label><Input value={s.currency || ''} onChange={e => setS({ ...s, currency: e.target.value })} className="glass border-white/10 mt-1" /></div>
          <div><Label>Símbolo</Label><Input value={s.currencySymbol || ''} onChange={e => setS({ ...s, currencySymbol: e.target.value })} className="glass border-white/10 mt-1" /></div>
          <div><Label>Edad mínima</Label><Input type="number" value={s.minAge || 18} onChange={e => setS({ ...s, minAge: Number(e.target.value) })} className="glass border-white/10 mt-1" /></div>
        </Card>
        <Card className="glass border-white/10 p-6 space-y-4">
          <h3 className="font-bold">WhatsApp</h3>
          <div><Label>Número (con código país, sin +)</Label><Input value={s.whatsappNumber || ''} onChange={e => setS({ ...s, whatsappNumber: e.target.value })} className="glass border-white/10 mt-1" placeholder="521234567890" /></div>
          <div><Label>Mensaje general</Label><Textarea value={s.whatsappMessage || ''} onChange={e => setS({ ...s, whatsappMessage: e.target.value })} className="glass border-white/10 mt-1" /></div>
        </Card>
        <Card className="glass border-white/10 p-6 space-y-4">
          <h3 className="font-bold">Redes sociales</h3>
          <div><Label>Instagram</Label><Input value={s.instagram || ''} onChange={e => setS({ ...s, instagram: e.target.value })} className="glass border-white/10 mt-1" /></div>
          <div><Label>TikTok</Label><Input value={s.tiktok || ''} onChange={e => setS({ ...s, tiktok: e.target.value })} className="glass border-white/10 mt-1" /></div>
          <div><Label>Facebook</Label><Input value={s.facebook || ''} onChange={e => setS({ ...s, facebook: e.target.value })} className="glass border-white/10 mt-1" /></div>
          <div><Label>Correo</Label><Input value={s.email || ''} onChange={e => setS({ ...s, email: e.target.value })} className="glass border-white/10 mt-1" /></div>
        </Card>
        <Card className="glass border-white/10 p-6 space-y-4">
          <h3 className="font-bold">Ubicación y legal</h3>
          <div><Label>Dirección</Label><Input value={s.address || ''} onChange={e => setS({ ...s, address: e.target.value })} className="glass border-white/10 mt-1" /></div>
          <div><Label>Horario</Label><Input value={s.hours || ''} onChange={e => setS({ ...s, hours: e.target.value })} className="glass border-white/10 mt-1" /></div>
          <div><Label>Texto del footer</Label><Textarea value={s.footerText || ''} onChange={e => setS({ ...s, footerText: e.target.value })} className="glass border-white/10 mt-1" /></div>
          <div><Label>Aviso legal</Label><Textarea value={s.legalNotice || ''} onChange={e => setS({ ...s, legalNotice: e.target.value })} className="glass border-white/10 mt-1" /></div>
        </Card>
      </div>
    </div>
  )
}

const MENU = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, Component: DashboardView },
  { key: 'products', label: 'Productos', icon: Package, Component: ProductsView },
  { key: 'categories', label: 'Categorías', icon: Grid3x3, Component: CategoriesView },
  { key: 'slider', label: 'Slider', icon: Sliders, Component: SliderView },
  { key: 'banners', label: 'Banners', icon: ImageIcon, Component: BannersView },
  { key: 'settings', label: 'Configuración', icon: Settings, Component: SettingsView },
]

function AdminApp() {
  const [tab, setTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const Current = MENU.find(m => m.key === tab)?.Component || DashboardView

  const logout = async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }) } catch {}
    setToken(null); window.location.reload()
  }

  return (
    <div className="min-h-screen radial-bg flex">
      <aside className={`fixed lg:relative z-40 h-screen w-64 glass-strong border-r border-white/10 flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center neon-glow"><Sparkles className="h-5 w-5 text-white" /></div>
            <div>
              <div className="font-bold text-sm">Cloud District</div>
              <div className="text-xs text-white/50">Admin panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {MENU.map(m => (
            <button key={m.key} onClick={() => { setTab(m.key); setSidebarOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${tab === m.key ? 'bg-gradient-to-r from-purple-600/20 to-cyan-500/20 text-white border border-purple-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              <m.icon className="h-4 w-4" /> {m.label}
              {tab === m.key && <ChevronRight className="h-3 w-3 ml-auto" />}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white"><LogOut className="h-4 w-4" /> Cerrar sesión</button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-30 glass-strong border-b border-white/10 p-4 flex items-center gap-4">
          <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(true)}><Sliders className="h-5 w-5" /></Button>
          <span className="font-bold">Cloud District Admin</span>
        </div>
        <div className="p-6 md:p-8">
          <Current />
        </div>
      </main>
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(null)
  useEffect(() => {
    const t = getToken()
    if (!t) { setAuthed(false); return }
    apiFetch('/auth/me').then(() => setAuthed(true)).catch(() => { setToken(null); setAuthed(false) })
  }, [])

  if (authed === null) return <div className="min-h-screen radial-bg flex items-center justify-center"><div className="text-white/60">Cargando...</div></div>
  if (!authed) return <LoginView onLogin={() => setAuthed(true)} />
  return <AdminApp />
}

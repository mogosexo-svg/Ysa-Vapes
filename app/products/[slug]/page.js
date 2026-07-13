'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageCircle, ArrowLeft, Sparkles, Check, ChevronRight } from 'lucide-react'
import { apiFetch, openWhatsApp, buildProductMessage, trackWhatsAppClick } from '@/lib/api'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [settings, setSettings] = useState(null)
  const [related, setRelated] = useState([])
  const [selectedImg, setSelectedImg] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const p = await apiFetch('/products/slug/' + params.slug)
        const s = await apiFetch('/settings')
        setProduct(p); setSettings(s)
        if (p.categoryId) {
          const rel = await apiFetch('/products?category=' + p.categoryId)
          setRelated(rel.filter(x => x.id !== p.id).slice(0, 4))
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [params.slug])

  if (loading) {
    return <div className="min-h-screen radial-bg pt-24 container mx-auto px-4"><Skeleton className="h-96 w-full bg-white/5" /></div>
  }
  if (!product) {
    return (
      <div className="min-h-screen radial-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-6xl font-black gradient-text mb-4">404</h1>
          <p className="text-white/60 mb-6">Producto no encontrado</p>
          <Button asChild><Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Volver</Link></Button>
        </div>
      </div>
    )
  }

  const soldOut = product.stock === 0
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0

  return (
    <div className="min-h-screen radial-bg pt-8 pb-20">
      <div className="container mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8">
          <ArrowLeft className="h-4 w-4" /> Volver a la tienda
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-square rounded-3xl overflow-hidden glass border-white/10 mb-4">
              <img src={product.images?.[selectedImg] || product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.slice(0, 5).map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)} className={`aspect-square rounded-xl overflow-hidden border-2 ${selectedImg === i ? 'border-purple-500' : 'border-white/10'}`}>
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-white/60 mb-2"><span>{product.categoryName}</span><ChevronRight className="h-3 w-3" /><span className="text-white">{product.name}</span></div>
            <div className="flex gap-2 mb-4">
              {product.tag && <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 border-0">{product.tag}</Badge>}
              {discount > 0 && <Badge className="bg-red-500/90 border-0">-{discount}%</Badge>}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{product.name}</h1>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-black gradient-text">${product.price}</span>
              {product.oldPrice && <span className="text-xl text-white/40 line-through">${product.oldPrice}</span>}
            </div>
            <div className="flex items-center gap-2 mb-6 text-sm">
              <span className={`h-2 w-2 rounded-full ${soldOut ? 'bg-red-500' : product.stockStatus === 'ultimas-unidades' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
              <span className="text-white/80">{soldOut ? 'Agotado' : product.stockStatus === 'ultimas-unidades' ? 'Últimas unidades disponibles' : 'Disponible'}</span>
            </div>
            <p className="text-white/70 leading-relaxed mb-8">{product.description}</p>

            {product.features && product.features.length > 0 && (
              <div className="glass border-white/10 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-400" /> Características</h3>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/80"><Check className="h-4 w-4 mt-0.5 text-cyan-400 shrink-0" />{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button size="lg" onClick={() => { const url = window.location.origin; trackWhatsAppClick({ productId: product.id, productName: product.name, source: 'product-detail' }); openWhatsApp({ number: settings?.whatsappNumber, message: buildProductMessage(product, url) }) }} className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-lg font-semibold gap-2 neon-glow">
              <MessageCircle className="h-5 w-5" /> Consultar por WhatsApp
            </Button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-black mb-8">Productos <span className="gradient-text">relacionados</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(r => (
                <Link key={r.id} href={`/products/${r.slug}`}>
                  <Card className="glass border-white/10 overflow-hidden group">
                    <div className="aspect-square overflow-hidden">
                      <img src={r.images?.[0]} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-purple-300/80 mb-1">{r.categoryName}</div>
                      <div className="font-semibold text-sm line-clamp-1">{r.name}</div>
                      <div className="text-sm gradient-text font-bold mt-1">${r.price}</div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

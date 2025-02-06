
import Image from 'next/image'
export default function Hero() {
  return <div className=" h-[100vh] w-full rounded-md relative flex flex-col items-center justify-center antialiased">
    <div className="w-40 h-40">
      <Image
alt="logo"
        src='https://kfbzgkjffmfzjzbxoqvr.supabase.co/storage/v1/object/public/images/woueziou.png'
        width={50}
        height={50}
      />
    </div>

    <h1>Taas S. Ekpaye</h1>


  </div>
}
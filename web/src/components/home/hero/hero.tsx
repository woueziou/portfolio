
import { cn } from '@/src/lib/utils';
import { SiGithub, SiMedium } from '@icons-pack/react-simple-icons';
import { Linkedin, Mail } from 'lucide-react';
import { Audiowide } from 'next/font/google';
import Image from 'next/image';
import React from 'react';
import { ThemeModeToggle } from '../../theme-switcher';
const amiko = Audiowide({ weight: '400',subsets:['latin'] })
type ContactType = {
  name: string,
  value: string,
  icon: React.ReactNode,
  type: "email" | "url"
}
export default function Hero() {
  const linkClass = "h-10 flex space-x-2 items-center border border-secondary/30 px-4 hover:bg-primary hover:text-white "
  // type contactType=
  const contacts: ContactType[] = [

    {
      name: 'Github',
      value: "https://github.com/woueziou",
      icon: <SiGithub className='h-5 w-5' />,
      type: 'url'
    },
    {
      name: 'Email',
      value: "taasekpaye@outlook.fr",
      icon: <Mail className='h-5 w-5' />,
      type: 'email'
    },
    {
      name: 'Medium',
      value: "https://medium.com/@taasekpaye",
      icon: <SiMedium className='h-5 w-5' />,
      type: 'url'
    },
    {
      name: 'LinkedIn',
      value: "https://www.linkedin.com/in/taas-ekpaye/",
      icon: <Linkedin className='h-5 w-5' />,
      type: 'url'
    },
  ]

  function getYearsSince2019(): number {
    const currentYear = new Date().getFullYear();
    return currentYear - 2019;
  }

  const yearsSince2019 = `${getYearsSince2019()}+`;

  return <div className=" md:h-[90vh] w-full rounded-md relative flex flex-col items-center justify-center antialiased">
    <div className={cn(
      "md:w-40 md:h-40 bg-background rounded-full md:overflow-hidden",
      "w-15 h-15"

    )}>
      <Image
        alt="logo"
        src='https://kfbzgkjffmfzjzbxoqvr.supabase.co/storage/v1/object/public/images//woueziou.png'
        width={200}
        height={200}
      />
    </div>
    <div className={cn('grid place-items-center md:grid-rows-2 md:gap-y-5 pt-4',
      ""
    )}>
      <h1 className={cn('text-3xl font-black lg:text-7xl', amiko.className)}>Taas S. Ekpaye</h1>
      <div className='row-span-1 flex flex-col items-center md:gap-5 gap-2'>
        <h3 className='text-balance text-muted-foreground px-8 py-2 rounded-full   lg:text-xl font-semibold flex items-center space-x-2' >
          <div className='font-extrabold item flex border h-8 w-8 justify-center rounded-sm items-center'>{yearsSince2019}</div>
          <div>Software Developer
          </div> </h3>
        <div className={cn('md:flex md:space-x-4',
          "grid gap-y-4"
        )}>
          {contacts.map((contact, index) => {
            if (contact.type === 'email') {
              return <a key={index} href={`mailto:${contact.value}`}
                className='h-10 flex space-x-2 items-center border border-secondary/30 px-4 hover:bg-primary hover:text-white '
              > <span

              >{contact.icon}
                </span>
                <span>
                  {contact.value}
                </span>
              </a>
            }
            return (
              <a key={index} target='_blank' href={contact.value} className={cn(
                linkClass
              )} >
                <span> {contact.icon}
                </span>
                <span>
                  {contact.name}
                </span>
              </a>
            )
          })}</div>
        {/* <ThemeModeToggle /> */}
      </div>
    </div>


  </div>
}
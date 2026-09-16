import RippleText from './ripple/RippleText'
import WaterImage from './ripple/WaterImage'

function App() {
  return (
    <div className="relative min-h-screen bg-[#fafeff] lg:flex lg:min-h-screen lg:items-center lg:justify-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35 sm:opacity-100"
        style={{ backgroundImage: "url('/motif.svg')", backgroundSize: '48px 48px', backgroundRepeat: 'repeat' }}
      />
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <filter id="star-alpha-boost">
            <feComponentTransfer>
              <feFuncA type="linear" slope="1.2" intercept="0" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <main className="relative mx-auto flex w-full max-w-[720px] flex-col px-6 pt-[56px] pb-10 sm:px-8 sm:pt-[100px] sm:pb-14 lg:px-0 lg:pb-[50px]">
        <header className="flex items-center gap-4 sm:items-start sm:gap-6 lg:gap-[22px]">
          <WaterImage
            src="/my%20photo.jpg"
            alt="Photo of Lavanya smiling indoors"
            className="h-[104px] w-[104px] flex-none rounded-[8px] sm:h-[140px] sm:w-[140px] sm:rounded-[9px] lg:h-[178px] lg:w-[181px]"
          />
          <div className="flex flex-col pt-0 sm:pt-6 lg:pt-[57px]">
            <RippleText
              as="h1"
              className="relative inline-block w-fit whitespace-nowrap text-[28px] font-medium leading-[1.21875] text-[#551999] sm:text-2xl lg:text-[32px] lg:tracking-[0.64px]"
            >
              Hi, I’m Lavanya
              <img
                src="/star.svg"
                alt=""
                aria-hidden="true"
                className="star-motif absolute -top-[0.41875em] left-[calc(100%-0.2em)] w-[1.8em] select-none sm:left-[calc(100%-0.84375em)] sm:w-[3.25em]"
              />
            </RippleText>
            <RippleText className="text-[18px] font-medium leading-[1.2] text-[#e821ba] sm:text-base lg:text-[20px] lg:tracking-[0.4px]">
              a product designer
            </RippleText>
          </div>
        </header>

        <section className="mt-[43px] flex flex-col gap-[34px] font-medium leading-[normal] text-[#551999] sm:mt-8 sm:gap-8 lg:mt-5 lg:gap-[50px]">
          <div className="text-[16px] leading-[1.4] sm:text-lg sm:leading-[normal] lg:text-[22px]">
            <RippleText>
              I have nearly 2 years of experience. I’ve worked at BharatPe{' '}
              <span className="font-bold">(fintech)</span> and at Roadcast{' '}
              <span className="font-bold">(SaaS, logistics)</span> in Gurugram,
              before switching to freelancing where I worked on all things
              design - packaging design, AI feedback intelligence platform,
              identity resolution to even making invites for my sister’s
              wedding :p{' '}
            </RippleText>
            <RippleText>It felt like the best re-ignition of my love for design&nbsp;&lt;3</RippleText>
          </div>
          <div className="text-[16px] leading-[1.4] sm:text-lg sm:leading-[normal] lg:text-[22px]">
            <RippleText>
              + I am a through &amp; through{' '}
              <span className="font-bold">systems thinker</span>, love laying
              out all pieces before hitting that first domino in motion.
            </RippleText>
            <RippleText>+ UX that translates smoothly into UI is my forte.</RippleText>
            <RippleText>+ I understand how design blends with business.</RippleText>
          </div>
          <RippleText className="text-[16px] leading-[1.4] sm:text-lg sm:leading-[normal] lg:text-[22px]">
            Apart from this, I enjoy reading - books &amp; articles on
            substack, I resonate with music, appreciate art a lot, create
            gradients, patterns, motifs and love to have intellectual
            conversations.
          </RippleText>
        </section>

        <a
          href="https://x.com/lavanyaaasharma"
          target="_blank"
          rel="noopener noreferrer"
          className="swoosh-link group relative mt-8 mb-10 inline-block w-fit text-[18px] font-medium leading-[normal] text-[#551999] sm:mb-12 sm:text-xl lg:mb-[70px] lg:text-[24px]"
        >
          <RippleText as="span">
            Say Hi{' '}
            <span className="relative inline-block">
              on X
              <img
                src="/swoosh.svg"
                alt=""
                aria-hidden="true"
                className="swoosh-img pointer-events-none absolute left-0 top-[calc(100%-0.125em)] w-[calc(100%+6px)] select-none opacity-[0.46] transition-all duration-200"
              />
            </span>{'!'}
          </RippleText>
        </a>

        <RippleText className="text-[16px] font-medium leading-[normal] text-[#e821ba] sm:text-base lg:text-[20px] lg:tracking-[0.4px]">
          [I kept hitting walls or running out of creative fuel while making
          my portfolio, honestly to the point where in quest to look for the
          reason, I created this page -{' '}
          <span className="cursor-default text-[#551999]">
            just for fun.
          </span>
          ]
        </RippleText>
      </main>
    </div>
  )
}

export default App

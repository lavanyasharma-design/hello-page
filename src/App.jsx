function App() {
  return (
    <div
      className="min-h-screen bg-[#fafeff] bg-repeat lg:flex lg:min-h-screen lg:items-center lg:justify-center"
      style={{ backgroundImage: "url('/motif.svg')", backgroundSize: '48px 48px' }}
    >
      <main className="mx-auto flex w-full max-w-[720px] flex-col px-6 pt-[100px] pb-10 sm:px-8 sm:pb-14 lg:px-0 lg:pb-[50px]">
        <header className="flex items-start gap-4 sm:gap-6 lg:gap-[22px]">
          <img
            src="/my%20photo.jpg"
            alt="Photo of Lavanya smiling indoors"
            className="h-[104px] w-[104px] flex-none rounded-[9px] object-cover object-bottom sm:h-[140px] sm:w-[140px] lg:h-[178px] lg:w-[181px]"
          />
          <div className="flex flex-col pt-3 sm:pt-6 lg:pt-[57px]">
            <h1 className="relative inline-block w-fit text-xl font-medium leading-[1.21875] text-[#551999] sm:text-2xl lg:text-[32px] lg:tracking-[0.64px]">
              Hi, I’m Lavanya
              <img
                src="/star.svg"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -top-[0.41875em] left-[calc(100%-0.84375em)] w-[3.25em] select-none"
              />
            </h1>
            <p className="text-sm font-medium leading-[1.2] text-[#e821ba] sm:text-base lg:text-[20px] lg:tracking-[0.4px]">
              a product designer
            </p>
          </div>
        </header>

        <section className="mt-8 flex flex-col gap-6 font-medium leading-[normal] text-[#551999] sm:gap-8 lg:mt-5 lg:gap-[50px]">
          <div className="text-sm leading-[normal] sm:text-lg lg:text-[24px]">
            <p>
              I have nearly 2 years of experience. I’ve worked at BharatPe{' '}
              <span className="font-bold">(fintech)</span> and at Roadcast{' '}
              <span className="font-bold">(SaaS, logistics)</span> in Gurugram,
              before switching to freelancing where I worked on all things
              design - packaging design, AI feedback intelligence platform,
              identity resolution to even making invites for my sister’s
              wedding :p{' '}
            </p>
            <p>It felt like the best re-ignition of my love for design &lt;3</p>
          </div>
          <div className="text-sm leading-[normal] sm:text-lg lg:text-[24px]">
            <p>
              + I am a through &amp; through{' '}
              <span className="font-bold">systems thinker</span>, love laying
              out all pieces before hitting that first domino in motion.
            </p>
            <p>+ UX that translates smoothly into UI is my forte.</p>
            <p>+ I understand how design blends with business.</p>
          </div>
          <p className="text-sm leading-[normal] sm:text-lg lg:text-[24px]">
            Apart from this, I enjoy reading - books &amp; articles on
            substack, I resonate with music, appreciate art a lot, create
            gradients, patterns, motifs and love to have intellectual
            conversations.
          </p>
        </section>

        <a
          href="https://x.com/lavanyaaasharma"
          target="_blank"
          rel="noopener noreferrer"
          className="swoosh-link group relative mt-8 mb-10 inline-block w-fit text-lg font-medium leading-[normal] text-[#551999] sm:mb-12 sm:text-xl lg:mb-[70px] lg:text-[24px]"
        >
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
        </a>

        <p className="text-xs font-medium leading-[normal] text-[#e821ba] sm:text-base lg:text-[20px] lg:tracking-[0.4px]">
          [I kept hitting walls or running out of creative fuel while making
          my portfolio, honestly to the point where in quest to look for the
          reason, I created this page -{' '}
          <span className="cursor-default text-[#551999]">
            just for fun.
          </span>
          ]
        </p>
      </main>
    </div>
  )
}

export default App

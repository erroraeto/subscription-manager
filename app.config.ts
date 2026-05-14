const primaryFocus = 'focus-visible:ring-primary! focus-visible:bg-primary/20'

export default defineAppConfig({
    ui: {
        colors: {
            primary: 'blue',
            neutral: 'slate'
        },
        header: {
            slots: {
                root: 'bg-transparent backdrop-filter-none border-none p-4',
                container: 'max-w-auto sm:px-0 lg:px-0 px-0',
                left: 'bg-muted/80 flex-none lg:flex-none backdrop-blur-xs rounded-full p-1 border border-muted/70 shadow-md inset-shadow-xs',
                right: 'bg-muted/80 flex-none lg:flex-none backdrop-blur-xs rounded-full p-1 border border-muted/70 shadow-md inset-shadow-xs',
                // right: 'bg-default/65 flex-none lg:flex-none backdrop-blur-xs rounded-full p-1 border border-accented shadow-lg inset-shadow-xs',
            }
        },
        dropdownMenu: {
            slots: {
                item: 'cursor-pointer before:rounded-sm',
            },
            variants: {
                active: {
                    false: {
                        item: [
                            'text-default data-highlighted:text-highlighted data-[state=open]:text-highlighted data-highlighted:before:bg-inverted/10 data-[state=open]:before:bg-inverted/10',
                            'transition-colors before:transition-colors'
                        ],
                    }
                }
            }
        },
        card: {
            slots: {
                root: 'rounded-md'
            }
        },
        button: {
            slots: {
                base: 'cursor-pointer'
            }
        },
        tabs: {
            slots: {
                trigger: 'cursor-pointer'
            }
        },
        input: {
            slots: {
                base: primaryFocus
            }
        },
        inputNumber: {
            slots: {
                base: primaryFocus
            }
        },
        selectMenu: {
            slots: {
                base: primaryFocus
            }
        },
        radioGroup: {
            slots: {
                fieldset: 'rounded-md -outline-offset-1 has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-primary',
                item: 'cursor-pointer',
            }
        },
        badge: {
            slots: {
                // base: 'xl:text-[10px]/3! lg:text-[9px]/3! md:text-[10px]/3!',
            },
            variants: {
                size: {
                    sm: {
                        base: 'xl:text-[10px]/3! lg:text-[9px]/3! md:text-[10px]/3!'
                    }
                }
            }
        }
    }
})
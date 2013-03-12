<?php

namespace SkreenHouseFactory\v3Bundle\Twig\Extension;

use Symfony\Component\HttpKernel\KernelInterface;

class toolsExtension extends \Twig_Extension
{
    public function __construct()
    {
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters()
    {
        return array(
            'to_array' => new \Twig_Filter_Method($this, 'to_array'),
        );
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'tools';
    }

    /**
     * cast object as array
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function to_array($stdClass)
    {
			return (array)$stdClass;
    }
}